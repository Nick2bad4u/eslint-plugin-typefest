/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-keys`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const preferTsExtrasObjectKeysRule: ReturnType<typeof createTypedRule> =
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
                        messageId: "preferTsExtrasObjectKeys",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras objectKeys over Object.keys for stronger key inference.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-object-keys.md",
            },
            messages: {
                preferTsExtrasObjectKeys:
                    "Prefer `objectKeys` from `ts-extras` over `Object.keys(...)` for stronger key inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-keys",
    });

export default preferTsExtrasObjectKeysRule;
