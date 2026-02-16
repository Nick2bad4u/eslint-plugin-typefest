import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const preferTsExtrasIsFiniteRule = createTypedRule({
    name: "prefer-ts-extras-is-finite",
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require ts-extras isFinite over Number.isFinite for consistent predicate helper usage.",
            recommended: true,
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-finite.md",
        },
        schema: [],
        messages: {
            preferTsExtrasIsFinite:
                "Prefer `isFinite` from `ts-extras` over `Number.isFinite(...)`.",
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
                if (node.callee.type !== "MemberExpression" || node.callee.computed) {
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
                    node,
                    messageId: "preferTsExtrasIsFinite",
                });
            },
        };
    },
});

export default preferTsExtrasIsFiniteRule;
