/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-merge-exclusive`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-merge-exclusive`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestMergeExclusiveRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                TSTypeReference(node) {
                    if (
                        node.typeName.type !== "Identifier" ||
                        node.typeName.name !== "XOR"
                    ) {
                        return;
                    }

                    context.report({
                        messageId: "preferMergeExclusive",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest MergeExclusive over `XOR` aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-merge-exclusive.md",
            },
            messages: {
                preferMergeExclusive:
                    "Prefer `MergeExclusive` from type-fest over `XOR`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-merge-exclusive",
    });

/**
 * Default export for the `prefer-type-fest-merge-exclusive` rule module.
 */
export default preferTypeFestMergeExclusiveRule;
