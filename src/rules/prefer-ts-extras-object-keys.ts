import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const preferTsExtrasObjectKeysRule: ReturnType<typeof createTypedRule> = createTypedRule({
    name: "prefer-ts-extras-object-keys",
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require ts-extras objectKeys over Object.keys for stronger key inference.",
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-object-keys.md",
        },
        schema: [],
        messages: {
            preferTsExtrasObjectKeys:
                "Prefer `objectKeys` from `ts-extras` over `Object.keys(...)` for stronger key inference.",
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
                    node.callee.object.name !== "Object"
                ) {
                    return;
                }

                if (
                    node.callee.property.type !== "Identifier" ||
                    node.callee.property.name !== "keys"
                ) {
                    return;
                }

                context.report({
                    node,
                    messageId: "preferTsExtrasObjectKeys",
                });
            },
        };
    },
});

export default preferTsExtrasObjectKeysRule;
