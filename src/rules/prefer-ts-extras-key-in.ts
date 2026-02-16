import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const preferTsExtrasKeyInRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-ts-extras-key-in",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require ts-extras keyIn over `in` key checks for stronger narrowing.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-key-in.md",
            },
            schema: [],
            messages: {
                preferTsExtrasKeyIn:
                    "Prefer `keyIn` from `ts-extras` over `key in object` checks for stronger narrowing.",
            },
        },
        defaultOptions: [],
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                BinaryExpression(node) {
                    if (node.operator !== "in") {
                        return;
                    }

                    context.report({
                        node,
                        messageId: "preferTsExtrasKeyIn",
                    });
                },
            };
        },
    });

export default preferTsExtrasKeyInRule;
