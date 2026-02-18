/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-from-entries`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const preferTsExtrasObjectFromEntriesRule: ReturnType<typeof createTypedRule> =
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
                        node.callee.property.name !== "fromEntries"
                    ) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasObjectFromEntries",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras objectFromEntries over Object.fromEntries for stronger key/value inference.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-object-from-entries.md",
            },
            messages: {
                preferTsExtrasObjectFromEntries:
                    "Prefer `objectFromEntries` from `ts-extras` over `Object.fromEntries(...)` for stronger key and value inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-from-entries",
    });

export default preferTsExtrasObjectFromEntriesRule;
