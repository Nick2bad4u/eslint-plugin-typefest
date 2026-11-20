/**
 * @packageDocumentation
 * Recognize builtin array filters whose output type can exclude falsy values.
 */
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { arrayFirst, isDefined } from "ts-extras";
import ts from "typescript";

import {
    getIdentifierPropertyMemberCall,
    type IdentifierPropertyMemberCallExpression,
} from "../_internal/member-call.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    createTypedRule,
    getTypedRuleServices,
    isGlobalIdentifierNamed,
} from "../_internal/typed-rule.js";

/** The literal types excluded by the upstream truthiness predicate. */
const isFalsyLiteral = (type: ts.Type, checker: ts.TypeChecker): boolean => {
    if (type.isLiteral()) {
        const { value } = type;
        return typeof value === "object"
            ? value.base10Value === "0"
            : value === "" || value === 0;
    }

    return (
        type === checker.getNullType() ||
        type === checker.getUndefinedType() ||
        type === checker.getFalseType()
    );
};

/**
 * Broad primitive types remain untouched, but unknown can exclude nullish
 * values.
 */
const hasFalsyMember = (
    element: ts.Type | undefined,
    checker: ts.TypeChecker
): boolean => {
    if (!isDefined(element)) {
        return false;
    }
    if (element === checker.getUnknownType()) {
        return true;
    }
    const members = element.isUnion() ? element.types : [element];
    return members.some((member) => isFalsyLiteral(member, checker));
};

/**
 * Check both the receiver and the selected overload before inspecting its
 * result.
 */
const canNarrowFilterResult = (
    call: Readonly<IdentifierPropertyMemberCallExpression>,
    {
        checker,
        parserServices,
    }: Readonly<ReturnType<typeof getTypedRuleServices>>
): boolean => {
    const nodes = parserServices.esTreeNodeToTSNodeMap;
    const receiver = checker.getTypeAtLocation(nodes.get(call.callee.object));
    const members = receiver.isUnion() ? receiver.types : [receiver];
    if (
        members.some(
            (member) =>
                !checker.isArrayType(member) && !checker.isTupleType(member)
        )
    ) {
        return false;
    }

    const tsCall = nodes.get(call);
    const declaration = checker.getResolvedSignature(tsCall)?.getDeclaration();
    if (
        !declaration ||
        parserServices.program?.isSourceFileDefaultLibrary(
            declaration.getSourceFile()
        ) !== true
    ) {
        return false;
    }
    const element = checker.getIndexTypeOfType(
        checker.getTypeAtLocation(tsCall),
        ts.IndexKind.Number
    );
    return hasFalsyMember(element, checker);
};

/** Recommend positive truthiness guards in builtin array filters. */
const preferTsExtrasIsTruthyRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const services = getTypedRuleServices(context);

            return {
                'CallExpression[callee.type="MemberExpression"][callee.property.name="filter"][arguments.0.name="Boolean"]'(
                    node
                ) {
                    const call = getIdentifierPropertyMemberCall({
                        memberName: "filter",
                        node,
                    });
                    if (
                        call?.arguments.length !== 1 ||
                        call.typeArguments !== undefined
                    ) {
                        return;
                    }
                    const callback = arrayFirst(call.arguments);
                    if (
                        callback?.type !== AST_NODE_TYPES.Identifier ||
                        !isGlobalIdentifierNamed(context, callback, "Boolean")
                    ) {
                        return;
                    }

                    if (canNarrowFilterResult(call, services)) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferTsExtrasIsTruthy",
                            node: callback,
                        });
                    }
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras isTruthy when filtering falsy types from an array.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                requiresUpstream: "ts-extras@2",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-truthy",
            },
            messages: {
                preferTsExtrasIsTruthy:
                    "Prefer `isTruthy` from `ts-extras` so the filtered array also excludes falsy types.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-truthy",
    });

export default preferTsExtrasIsTruthyRule;
