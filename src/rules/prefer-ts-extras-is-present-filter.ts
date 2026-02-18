/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-present-filter`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const flattenLogicalAndTerms = (
    expression: TSESTree.Expression
): readonly TSESTree.Expression[] => {
    if (
        expression.type !== "LogicalExpression" ||
        expression.operator !== "&&"
    ) {
        return [expression];
    }

    return [
        ...flattenLogicalAndTerms(expression.left),
        ...flattenLogicalAndTerms(expression.right),
    ];
};

const isNullComparison = (
    node: TSESTree.Expression,
    parameterName: string
): node is TSESTree.BinaryExpression =>
    node.type === "BinaryExpression" &&
    (node.operator === "!=" || node.operator === "!==") &&
    ((node.left.type === "Identifier" &&
        node.left.name === parameterName &&
        node.right.type === "Literal" &&
        node.right.value === null) ||
        (node.right.type === "Identifier" &&
            node.right.name === parameterName &&
            node.left.type === "Literal" &&
            node.left.value === null));

const isUndefinedComparison = (
    node: TSESTree.Expression,
    parameterName: string
): node is TSESTree.BinaryExpression => {
    if (
        node.type !== "BinaryExpression" ||
        (node.operator !== "!=" && node.operator !== "!==")
    ) {
        return false;
    }

    const isDirectUndefinedComparison =
        (node.left.type === "Identifier" &&
            node.left.name === parameterName &&
            node.right.type === "Identifier" &&
            node.right.name === "undefined") ||
        (node.right.type === "Identifier" &&
            node.right.name === parameterName &&
            node.left.type === "Identifier" &&
            node.left.name === "undefined");

    if (isDirectUndefinedComparison) {
        return true;
    }

    return (
        node.left.type === "UnaryExpression" &&
        node.left.operator === "typeof" &&
        node.left.argument.type === "Identifier" &&
        node.left.argument.name === parameterName &&
        node.right.type === "Literal" &&
        node.right.value === "undefined"
    );
};

const isNullishFilterGuardBody = (
    callback: TSESTree.ArrowFunctionExpression & { body: TSESTree.Expression },
    parameterName: string
): boolean => {
    const { body } = callback;

    if (
        isNullComparison(body, parameterName) ||
        isUndefinedComparison(body, parameterName)
    ) {
        if (body.operator === "!=") {
            return true;
        }

        return callback.returnType?.typeAnnotation.type === "TSTypePredicate";
    }

    const andTerms = flattenLogicalAndTerms(body);
    const hasNullComparison = andTerms.some((term) =>
        isNullComparison(term, parameterName)
    );
    const hasUndefinedComparison = andTerms.some((term) =>
        isUndefinedComparison(term, parameterName)
    );

    return hasNullComparison && hasUndefinedComparison;
};

const preferTsExtrasIsPresentFilterRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                CallExpression(node) {
                    const { callee } = node;

                    if (
                        callee.type !== "MemberExpression" ||
                        callee.computed ||
                        callee.property.type !== "Identifier" ||
                        callee.property.name !== "filter" ||
                        node.arguments.length === 0
                    ) {
                        return;
                    }

                    const callback = node.arguments[0];

                    if (
                        callback?.type !== "ArrowFunctionExpression" ||
                        callback.params.length !== 1 ||
                        callback.body.type === "BlockStatement"
                    ) {
                        return;
                    }

                    const parameter = callback.params[0];
                    if (parameter?.type !== "Identifier") {
                        return;
                    }

                    const expressionCallback =
                        callback as TSESTree.ArrowFunctionExpression & {
                            body: TSESTree.Expression;
                        };

                    if (
                        !isNullishFilterGuardBody(
                            expressionCallback,
                            parameter.name
                        )
                    ) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasIsPresentFilter",
                        node: expressionCallback,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras isPresent in Array.filter callbacks instead of inline nullish checks.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-present-filter.md",
            },
            messages: {
                preferTsExtrasIsPresentFilter:
                    "Prefer `isPresent` from `ts-extras` in `filter(...)` callbacks over inline nullish comparisons.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-present-filter",
    });

export default preferTsExtrasIsPresentFilterRule;
