import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const preferTsExtrasIsIntegerRule = createTypedRule({
    name: "prefer-ts-extras-is-integer",
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require ts-extras isInteger over Number.isInteger for consistent predicate helper usage.",
            recommended: true,
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-integer.md",
        },
        schema: [],
        messages: {
            preferTsExtrasIsInteger:
                "Prefer `isInteger` from `ts-extras` over `Number.isInteger(...)`.",
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
                    node.callee.property.name !== "isInteger"
                ) {
                    return;
                }

                context.report({
                    node,
                    messageId: "preferTsExtrasIsInteger",
                });
            },
        };
    },
});

export default preferTsExtrasIsIntegerRule;
