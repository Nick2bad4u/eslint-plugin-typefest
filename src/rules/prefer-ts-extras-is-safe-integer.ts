import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const preferTsExtrasIsSafeIntegerRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-ts-extras-is-safe-integer",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require ts-extras isSafeInteger over Number.isSafeInteger for consistent predicate helper usage.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-safe-integer.md",
            },
            schema: [],
            messages: {
                preferTsExtrasIsSafeInteger:
                    "Prefer `isSafeInteger` from `ts-extras` over `Number.isSafeInteger(...)`.",
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
                        node.callee.property.name !== "isSafeInteger"
                    ) {
                        return;
                    }

                    context.report({
                        node,
                        messageId: "preferTsExtrasIsSafeInteger",
                    });
                },
            };
        },
    });

export default preferTsExtrasIsSafeIntegerRule;
