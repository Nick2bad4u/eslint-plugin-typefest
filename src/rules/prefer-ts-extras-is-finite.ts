import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const preferTsExtrasIsFiniteRule: ReturnType<typeof createTypedRule> =
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
                        node.callee.property.name !== "isFinite"
                    ) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasIsFinite",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras isFinite over Number.isFinite for consistent predicate helper usage.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-finite.md",
            },
            messages: {
                preferTsExtrasIsFinite:
                    "Prefer `isFinite` from `ts-extras` over `Number.isFinite(...)`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-finite",
    });

export default preferTsExtrasIsFiniteRule;
