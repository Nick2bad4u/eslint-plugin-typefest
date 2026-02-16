import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const preferTsExtrasObjectEntriesRule = createTypedRule({
    name: "prefer-ts-extras-object-entries",
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require ts-extras objectEntries over Object.entries for stronger key/value inference.",
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-object-entries.md",
        },
        schema: [],
        messages: {
            preferTsExtrasObjectEntries:
                "Prefer `objectEntries` from `ts-extras` over `Object.entries(...)` for stronger key and value inference.",
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
                    node.callee.property.name !== "entries"
                ) {
                    return;
                }

                context.report({
                    node,
                    messageId: "preferTsExtrasObjectEntries",
                });
            },
        };
    },
});

export default preferTsExtrasObjectEntriesRule;
