/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-not`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const FILTER_METHOD_NAME = "filter";

/**
 * Check whether the input is filter call.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is filter call; otherwise `false`.
 */

const isFilterCall = (
    node: TSESTree.CallExpression
): node is TSESTree.CallExpression & {
    callee: TSESTree.MemberExpression & {
        computed: false;
        property: TSESTree.Identifier;
    };
} =>
    node.callee.type === "MemberExpression" &&
    !node.callee.computed &&
    node.callee.property.type === "Identifier" &&
    node.callee.property.name === FILTER_METHOD_NAME;

/**
 * Check whether the input is target callback parameter.
 *
 * @param argument - Value to inspect.
 * @param parameterName - Value to inspect.
 *
 * @returns `true` when the value is target callback parameter; otherwise `false`.
 */

const isTargetCallbackParameter = (
    argument: TSESTree.CallExpressionArgument,
    parameterName: string
): boolean => argument.type === "Identifier" && argument.name === parameterName;

/**
 * GetNegatedPredicateCall helper.
 *
 * @param callback - Value to inspect.
 *
 * @returns GetNegatedPredicateCall helper result.
 */

const getNegatedPredicateCall = (
    callback: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression
): null | TSESTree.CallExpression => {
    if (callback.params.length !== 1) {
        return null;
    }

    const [firstParameter] = callback.params;
    if (firstParameter?.type !== "Identifier") {
        return null;
    }

    const callbackBody = callback.body;
    if (
        callbackBody.type !== "UnaryExpression" ||
        callbackBody.operator !== "!" ||
        callbackBody.argument.type !== "CallExpression"
    ) {
        return null;
    }

    const predicateCall = callbackBody.argument;
    if (predicateCall.arguments.length !== 1) {
        return null;
    }

    const [firstArgument] = predicateCall.arguments;
    return firstArgument &&
        isTargetCallbackParameter(firstArgument, firstParameter.name)
        ? predicateCall
        : null;
};

/**
 * ESLint rule definition for `prefer-ts-extras-not`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasNotRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                CallExpression(node) {
                    if (!isFilterCall(node) || node.arguments.length === 0) {
                        return;
                    }

                    const [firstArgument] = node.arguments;
                    if (
                        !firstArgument ||
                        (firstArgument.type !== "ArrowFunctionExpression" &&
                            firstArgument.type !== "FunctionExpression")
                    ) {
                        return;
                    }

                    if (!getNegatedPredicateCall(firstArgument)) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasNot",
                        node: firstArgument,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras not helper over inline negated predicate callbacks in filter calls.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-not.md",
            },
            messages: {
                preferTsExtrasNot:
                    "Prefer `not(<predicate>)` from `ts-extras` over inline `value => !predicate(value)` callbacks.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-not",
    });

/**
 * Default export for the `prefer-ts-extras-not` rule module.
 */
export default preferTsExtrasNotRule;

