import { type TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const FILTER_METHOD_NAME = "filter";

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

const isTargetCallbackParameter = (
    argument: TSESTree.CallExpressionArgument,
    parameterName: string
): boolean => argument.type === "Identifier" && argument.name === parameterName;

const getNegatedPredicateCall = (
    callback: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression
): null | TSESTree.CallExpression => {
    if (callback.params.length !== 1) {
        return null;
    }

    const [firstParameter] = callback.params;
    if (!firstParameter || firstParameter.type !== "Identifier") {
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

const preferTsExtrasNotRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-ts-extras-not",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require ts-extras not helper over inline negated predicate callbacks in filter calls.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-not.md",
            },
            schema: [],
            messages: {
                preferTsExtrasNot:
                    "Prefer `not(<predicate>)` from `ts-extras` over inline `value => !predicate(value)` callbacks.",
            },
        },
        defaultOptions: [],
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
                        node: firstArgument,
                        messageId: "preferTsExtrasNot",
                    });
                },
            };
        },
    });

export default preferTsExtrasNotRule;
