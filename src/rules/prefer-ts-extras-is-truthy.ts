/**
 * @packageDocumentation
 * Recognize builtin array filters whose output type can exclude falsy values.
 */
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import ts from "typescript";

import { getIdentifierPropertyMemberCall } from "../_internal/member-call.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    createTypedRule,
    getTypedRuleServices,
    isGlobalIdentifierNamed,
} from "../_internal/typed-rule.js";

/** `isTruthy` excludes falsy literals but retains broad primitive types. */
const hasFalsyMember = (type: ts.Type, checker: ts.TypeChecker): boolean => {
    if (type === checker.getUnknownType()) {
        return true;
    }

    const members = type.isUnion() ? type.types : [type];
    return members.some(
        (member) =>
            member === checker.getNullType() ||
            member === checker.getUndefinedType() ||
            member === checker.getFalseType() ||
            (member.isStringLiteral() && member.value === "") ||
            (member.isNumberLiteral() && member.value === 0) ||
            (member.isLiteral() &&
                typeof member.value === "object" &&
                member.value.base10Value === "0")
    );
};

/** Recommend positive truthiness guards in builtin array filters. */
const preferTsExtrasIsTruthyRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const { checker, parserServices } = getTypedRuleServices(context);

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
                    const [callback] = call.arguments;
                    if (
                        callback?.type !== AST_NODE_TYPES.Identifier ||
                        !isGlobalIdentifierNamed(context, callback, "Boolean")
                    ) {
                        return;
                    }

                    const receiver = checker.getTypeAtLocation(
                        parserServices.esTreeNodeToTSNodeMap.get(
                            call.callee.object
                        )
                    );
                    const members = receiver.isUnion()
                        ? receiver.types
                        : [receiver];
                    if (
                        members.some(
                            (member) =>
                                !checker.isArrayType(member) &&
                                !checker.isTupleType(member)
                        )
                    ) {
                        return;
                    }

                    const tsCall =
                        parserServices.esTreeNodeToTSNodeMap.get(call);
                    const declaration = checker
                        .getResolvedSignature(tsCall)
                        ?.getDeclaration();
                    if (
                        !declaration ||
                        parserServices.program?.isSourceFileDefaultLibrary(
                            declaration.getSourceFile()
                        ) !== true
                    ) {
                        return;
                    }

                    const resultElement = checker.getIndexTypeOfType(
                        checker.getTypeAtLocation(tsCall),
                        ts.IndexKind.Number
                    );
                    if (
                        resultElement &&
                        hasFalsyMember(resultElement, checker)
                    ) {
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
