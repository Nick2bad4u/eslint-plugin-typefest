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
import { arrayFirst, isEmpty } from "ts-extras";
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

/** Match only concrete builtins. Structural substitutes may override the method. */
const getSearchType = (
    checker: ts.TypeChecker,
    receiver: ts.Type,
    method: SearchMethod,
    program: ts.Program
): ts.Type | undefined => {
    if (method === "has") {
        const symbol = receiver.getSymbol();
        const name = symbol?.getName();
        return (name === "Map" || name === "ReadonlyMap") &&
            symbol?.declarations?.some(
                (declaration) =>
                    ts.isInterfaceDeclaration(declaration) &&
                    program.isSourceFileDefaultLibrary(
                        declaration.getSourceFile()
                    )
            ) === true
            ? arrayFirst(getTypeCheckerTypeArguments(checker, receiver) ?? [])
            : undefined;
    }

    if (method === "indexOf" || method === "lastIndexOf") {
        return checker.isArrayType(receiver) || checker.isTupleType(receiver)
            ? checker.getIndexTypeOfType(receiver, ts.IndexKind.Number)
            : undefined;
    }

    // A String object coerces to a primitive in native calls but is not a string argument.
    return !isTypeAnyType(receiver) &&
        !isTypeNeverType(receiver) &&
        checker.isTypeAssignableTo(receiver, checker.getStringType())
        ? checker.getStringType()
        : undefined;
};

/**
 * Both search overloads accept related item/key types; string searches require
 * a string.
 */
const acceptsSearchValue = (
    checker: ts.TypeChecker,
    method: SearchMethod,
    expected: ts.Type,
    actual: ts.Type
): boolean => {
    if (isTypeAnyType(actual) || isTypeNeverType(actual)) {
        return false;
    }
    if (checker.isTypeAssignableTo(actual, expected)) {
        return true;
    }
    if (
        method === "startsWith" ||
        method === "endsWith" ||
        !checker.isTypeAssignableTo(expected, actual)
    ) {
        return false;
    }

    // A map can lack a key of its declared type. Skip a wider union when the
    // guard's false branch could discard one of its possible runtime keys.
    if (method !== "has") {
        return true;
    }
    if (actual.isUnion()) {
        return actual.types.every(
            (part) => !checker.isTypeAssignableTo(part, expected)
        );
    }
    return !actual.isTypeParameter();
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

/** Create a report-only listener for the corresponding standard-library method. */
export const createNativeSearchListener = <MessageId extends string>(
    context: Readonly<TSESLint.RuleContext<MessageId, UnknownArray>>,
    method: SearchMethod,
    messageId: MessageId
): TSESLint.RuleListener => {
    const { checker, parserServices } = getTypedRuleServices(context);
    const { program } = parserServices;
    if (!program) {
        return {};
    }

    return {
        [`CallExpression[callee.property.name="${method}"]`](
            node: TSESTree.CallExpression
        ) {
            const call = getIdentifierPropertyMemberCall({
                memberName: method,
                node,
            });
            if (!call) {
                return;
            }
            const search = arrayFirst(call.arguments);
            if (
                search === undefined ||
                call.typeArguments !== undefined ||
                call.arguments.length > (method === "has" ? 1 : 2) ||
                call.arguments.some(
                    (argument) =>
                        argument.type === AST_NODE_TYPES.SpreadElement ||
                        ASTUtils.hasSideEffect(argument, context.sourceCode, {
                            considerGetters: true,
                            considerImplicitTypeConversion: true,
                        })
                )
            ) {
                return;
            }

            const tsCall = parserServices.esTreeNodeToTSNodeMap.get(call);
            if (ts.isOptionalChain(tsCall)) {
                return;
            }

            const receiver = checker.getTypeAtLocation(
                parserServices.esTreeNodeToTSNodeMap.get(call.callee.object)
            );
            const expected = getSearchType(checker, receiver, method, program);
            const declarations = checker
                .getPropertyOfType(receiver, method)
                ?.getDeclarations();
            if (
                !expected ||
                !declarations ||
                isEmpty(declarations) ||
                declarations.some(
                    (declaration) =>
                        !ts.isMethodSignature(declaration) ||
                        !program.isSourceFileDefaultLibrary(
                            declaration.getSourceFile()
                        )
                )
            ) {
                return;
            }

            const actual = checker.getTypeAtLocation(
                parserServices.esTreeNodeToTSNodeMap.get(search)
            );
            const offset = call.arguments[1];
            if (
                offset &&
                !acceptsPosition(
                    checker,
                    checker.getTypeAtLocation(
                        parserServices.esTreeNodeToTSNodeMap.get(offset)
                    )
                )
            ) {
                return;
            }

            if (acceptsSearchValue(checker, method, expected, actual)) {
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
