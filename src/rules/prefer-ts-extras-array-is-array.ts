/**
 * @packageDocumentation
 * Recognize builtin Array.isArray checks that lose element information.
 */
import { isTypeFlagSet } from "@typescript-eslint/type-utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import ts from "typescript";

import { getGlobalIdentifierMemberCall } from "../_internal/global-identifier-member-call.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";

/** A deferred non-array union member might itself become an array. */
const isDeferredMember = (type: ts.Type): boolean =>
    type.isIntersection()
        ? type.types.some((member) => isDeferredMember(member))
        : isTypeFlagSet(type, ts.TypeFlags.TypeVariable) ||
          isTypeFlagSet(type, ts.TypeFlags.Conditional) ||
          isTypeFlagSet(type, ts.TypeFlags.Substitution);

/**
 * A naked type parameter can also represent an array at runtime. The
 * conditional type behind arrayIsArray cannot narrow T | T[] to T[].
 */
const benefitsFromArrayGuard = (
    type: ts.Type,
    checker: ts.TypeChecker
): boolean => {
    if (type === checker.getUnknownType()) {
        return true;
    }

    const members = type.isUnion() ? type.types : [type];
    return (
        members.every((member) => !isDeferredMember(member)) &&
        members.some(
            (member) =>
                (checker.isArrayType(member) || checker.isTupleType(member)) &&
                !checker.getPropertyOfType(member, "push")
        )
    );
};

/** Recommend the stronger array predicate only for supported input types. */
const preferTsExtrasArrayIsArrayRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const { checker, parserServices } = getTypedRuleServices(context);

            return {
                'CallExpression[callee.type="MemberExpression"][callee.property.name="isArray"]'(
                    node
                ) {
                    const call = getGlobalIdentifierMemberCall({
                        context,
                        memberName: "isArray",
                        node,
                        objectName: "Array",
                    });
                    if (
                        call?.arguments.length !== 1 ||
                        call.typeArguments !== undefined
                    ) {
                        return;
                    }
                    const [argument] = call.arguments;
                    if (
                        !argument ||
                        argument.type === AST_NODE_TYPES.SpreadElement
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

                    const input = checker.getTypeAtLocation(
                        parserServices.esTreeNodeToTSNodeMap.get(argument)
                    );
                    if (benefitsFromArrayGuard(input, checker)) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferTsExtrasArrayIsArray",
                            node: call.callee,
                        });
                    }
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras arrayIsArray for more precise array narrowing.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                requiresUpstream: "ts-extras@2",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-is-array",
            },
            messages: {
                preferTsExtrasArrayIsArray:
                    "Prefer `arrayIsArray` from `ts-extras` to preserve array element types during narrowing.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-is-array",
    });

export default preferTsExtrasArrayIsArrayRule;
