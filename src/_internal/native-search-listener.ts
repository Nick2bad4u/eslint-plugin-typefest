/**
 * @packageDocumentation
 * Match native array, string and map search calls supported by ts-extras.
 */
import type { UnknownArray } from "type-fest";

import { isTypeAnyType, isTypeNeverType } from "@typescript-eslint/type-utils";
import {
    AST_NODE_TYPES,
    ASTUtils,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayAt, arrayFirst, isEmpty } from "ts-extras";
import ts from "typescript";

import { getIdentifierPropertyMemberCall } from "./member-call.js";
import { reportWithOptionalFix } from "./rule-reporting.js";
import { getTypeCheckerTypeArguments } from "./type-checker-compat.js";
import { getTypedRuleServices } from "./typed-rule.js";

type SearchMethod =
    | "endsWith"
    | "has"
    | "indexOf"
    | "lastIndexOf"
    | "startsWith";

const isStringSearch = (method: SearchMethod): boolean =>
    method === "startsWith" || method === "endsWith";

const isKnownSearchType = (type: ts.Type): boolean =>
    !isTypeAnyType(type) && !isTypeNeverType(type);

/**
 * A local Map can inherit or borrow a native method while using different key
 * types.
 */
const getNativeMapKeyType = (
    checker: ts.TypeChecker,
    receiver: ts.Type,
    program: ts.Program
) => {
    const symbol = receiver.getSymbol();
    const name = symbol?.getName();
    if (name !== "Map" && name !== "ReadonlyMap") {
        return undefined;
    }
    const builtinDeclaration = symbol?.declarations?.some(
        (declaration) =>
            ts.isInterfaceDeclaration(declaration) &&
            program.isSourceFileDefaultLibrary(declaration.getSourceFile())
    );
    return builtinDeclaration === true
        ? arrayFirst(getTypeCheckerTypeArguments(checker, receiver) ?? [])
        : undefined;
};

/**
 * An overload from an augmentation can change the return type or argument
 * contract.
 */
const hasOnlyNativeMethods = (
    checker: ts.TypeChecker,
    program: ts.Program,
    receiver: ts.Type,
    method: SearchMethod
): boolean => {
    const declarations =
        checker.getPropertyOfType(receiver, method)?.getDeclarations() ?? [];
    return (
        !isEmpty(declarations) &&
        declarations.every(
            (declaration) =>
                ts.isMethodSignature(declaration) &&
                program.isSourceFileDefaultLibrary(declaration.getSourceFile())
        )
    );
};

/** Match only concrete builtins. Structural substitutes may override the method. */
const getSearchType = (
    checker: ts.TypeChecker,
    receiver: ts.Type,
    method: SearchMethod,
    program: ts.Program
) => {
    if (!hasOnlyNativeMethods(checker, program, receiver, method)) {
        return undefined;
    }
    if (method === "has") {
        return getNativeMapKeyType(checker, receiver, program);
    }
    if (isStringSearch(method)) {
        const stringType = checker.getStringType();
        return isKnownSearchType(receiver) &&
            checker.isTypeAssignableTo(receiver, stringType)
            ? stringType
            : undefined;
    }
    return checker.isArrayType(receiver) || checker.isTupleType(receiver)
        ? checker.getIndexTypeOfType(receiver, ts.IndexKind.Number)
        : undefined;
};

/** A missing map key can still have the declared key type. */
const preservesMissingKeys = (
    checker: ts.TypeChecker,
    key: ts.Type,
    candidate: ts.Type
): boolean => {
    if (candidate.isUnion()) {
        return candidate.types.every(
            (part) => !checker.isTypeAssignableTo(part, key)
        );
    }
    return !candidate.isTypeParameter();
};

/**
 * String searches take a string; array and map searches additionally accept
 * wider candidates.
 */
const acceptsSearchValue = (
    checker: ts.TypeChecker,
    method: SearchMethod,
    expected: ts.Type,
    actual: ts.Type
): boolean => {
    if (!isKnownSearchType(actual)) {
        return false;
    }
    if (checker.isTypeAssignableTo(actual, expected)) {
        return true;
    }
    return (
        !isStringSearch(method) &&
        checker.isTypeAssignableTo(expected, actual) &&
        (method !== "has" || preservesMissingKeys(checker, expected, actual))
    );
};

/** Search offsets may be numeric, undefined, or a union of the two. */
const acceptsPosition = (
    checker: ts.TypeChecker,
    position: ts.Type
): boolean => {
    const parts = position.isUnion() ? position.types : [position];
    return parts.every(
        (part) =>
            !isTypeAnyType(part) &&
            (part === checker.getUndefinedType() ||
                checker.isTypeAssignableTo(part, checker.getNumberType()))
    );
};

/** Verify both arity and evaluation order before considering a helper call. */
const getSearchArgument = (
    node: Readonly<TSESTree.CallExpression>,
    method: SearchMethod,
    sourceCode: Readonly<TSESLint.SourceCode>
) => {
    const maximum = method === "has" ? 1 : 2;
    if (
        node.typeArguments !== undefined ||
        node.arguments.length > maximum ||
        node.arguments.some(
            (argument) =>
                argument.type === AST_NODE_TYPES.SpreadElement ||
                ASTUtils.hasSideEffect(argument, sourceCode, {
                    considerGetters: true,
                    considerImplicitTypeConversion: true,
                })
        )
    ) {
        return undefined;
    }
    return arrayFirst(node.arguments);
};

/** Create a report-only listener for the corresponding standard-library method. */
export const createNativeSearchListener = <MessageId extends string>(
    context: Readonly<TSESLint.RuleContext<MessageId, UnknownArray>>,
    method: SearchMethod,
    messageId: MessageId
): TSESLint.RuleListener => {
    const { checker, parserServices } = getTypedRuleServices(context);
    const { esTreeNodeToTSNodeMap, program } = parserServices;
    if (!program) {
        return {};
    }
    const typeOf = (node: TSESTree.Node): ts.Type =>
        checker.getTypeAtLocation(esTreeNodeToTSNodeMap.get(node));

    return {
        [`CallExpression[callee.property.name="${method}"]`](
            node: TSESTree.CallExpression
        ) {
            const call = getIdentifierPropertyMemberCall({
                memberName: method,
                node,
            });
            if (!call || ts.isOptionalChain(esTreeNodeToTSNodeMap.get(call))) {
                return;
            }
            const search = getSearchArgument(call, method, context.sourceCode);
            if (!search) {
                return;
            }

            const receiver = typeOf(call.callee.object);
            const expected = getSearchType(checker, receiver, method, program);
            if (!expected) {
                return;
            }

            const offset = arrayAt(call.arguments, 1);
            if (offset && !acceptsPosition(checker, typeOf(offset))) {
                return;
            }
            if (acceptsSearchValue(checker, method, expected, typeOf(search))) {
                reportWithOptionalFix({
                    context,
                    fix: null,
                    messageId,
                    node: call.callee.property,
                });
            }
        },
    };
};
