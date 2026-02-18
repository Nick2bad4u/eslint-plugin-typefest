/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-integer`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const preferTsExtrasIsIntegerRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                CallExpression(node) {
                    if (
                        node.callee.type !== "MemberExpression" ||
                        node.callee.computed
                    ) {
                        return;
                    }

                    if (
                        node.callee.object.type !== "Identifier" ||
                        node.callee.object.name !== "Number"
                    ) {
                        return;
                    }

                    if (
                        node.callee.property.type !== "Identifier" ||
                        node.callee.property.name !== "isInteger"
                    ) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasIsInteger",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras isInteger over Number.isInteger for consistent predicate helper usage.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-integer.md",
            },
            messages: {
                preferTsExtrasIsInteger:
                    "Prefer `isInteger` from `ts-extras` over `Number.isInteger(...)`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-integer",
    });

export default preferTsExtrasIsIntegerRule;
