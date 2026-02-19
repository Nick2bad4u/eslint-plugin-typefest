/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-merge-exclusive`.
 */
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
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

            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                "type-fest"
            );

            return {
                TSTypeReference(node) {
                    if (
                        node.typeName.type !== "Identifier" ||
                        node.typeName.name !== "XOR"
                    ) {
                        return;
                    }

                    const aliasReplacementFix =
                        createSafeTypeReferenceReplacementFix(
                            node,
                            "MergeExclusive",
                            typeFestDirectImports
                        );

                    context.report({
                        ...(aliasReplacementFix
                            ? { fix: aliasReplacementFix }
                            : {}),
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
            fixable: "code",
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
