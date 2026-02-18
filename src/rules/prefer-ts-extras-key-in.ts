/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-key-in`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-key-in`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasKeyInRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
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
                        messageId: "preferTsExtrasKeyIn",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras keyIn over `in` key checks for stronger narrowing.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-key-in.md",
            },
            messages: {
                preferTsExtrasKeyIn:
                    "Prefer `keyIn` from `ts-extras` over `key in object` checks for stronger narrowing.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-key-in",
    });

/**
 * Default export for the `prefer-ts-extras-key-in` rule module.
 */
export default preferTsExtrasKeyInRule;

