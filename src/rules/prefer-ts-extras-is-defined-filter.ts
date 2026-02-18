/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-defined-filter`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const isUndefinedFilterGuardBody = (
    body: TSESTree.Expression,
    parameterName: string
): boolean => {
    if (body.type !== "BinaryExpression") {
        return false;
    }

    if (body.operator !== "!==" && body.operator !== "!=") {
        return false;
    }

    const isDirectUndefinedComparison =
        (body.left.type === "Identifier" &&
            body.left.name === parameterName &&
            body.right.type === "Identifier" &&
            body.right.name === "undefined") ||
        (body.right.type === "Identifier" &&
            body.right.name === parameterName &&
            body.left.type === "Identifier" &&
            body.left.name === "undefined");

    if (isDirectUndefinedComparison) {
        return true;
    }

    return (
        body.left.type === "UnaryExpression" &&
        body.left.operator === "typeof" &&
        body.left.argument.type === "Identifier" &&
        body.left.argument.name === parameterName &&
        body.right.type === "Literal" &&
        body.right.value === "undefined"
    );
};

const preferTsExtrasIsDefinedFilterRule: ReturnType<typeof createTypedRule> =
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

                    if (
                        !isUndefinedFilterGuardBody(
                            callback.body,
                            parameter.name
                        )
                    ) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasIsDefinedFilter",
                        node: callback,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras isDefined in Array.filter callbacks instead of inline undefined checks.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-defined-filter.md",
            },
            messages: {
                preferTsExtrasIsDefinedFilter:
                    "Prefer `isDefined` from `ts-extras` in `filter(...)` callbacks over inline undefined comparisons.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-defined-filter",
    });

export default preferTsExtrasIsDefinedFilterRule;
