/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-omit-index-signature`.
 */
import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const omitIndexSignatureAliasReplacements = {
    RemoveIndexSignature: "OmitIndexSignature",
} as const;

/**
 * ESLint rule definition for `prefer-type-fest-omit-index-signature`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestOmitIndexSignatureRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            const importedAliasMatches = collectImportedTypeAliasMatches(
                context.sourceCode,
                omitIndexSignatureAliasReplacements
            );

            return {
                TSTypeReference(node) {
                    if (node.typeName.type !== "Identifier") {
                        return;
                    }

                    const importedAliasMatch = importedAliasMatches.get(
                        node.typeName.name
                    );
                    if (!importedAliasMatch) {
                        return;
                    }

                    context.report({
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                        messageId: "preferOmitIndexSignature",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest OmitIndexSignature over imported aliases such as RemoveIndexSignature.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-omit-index-signature.md",
            },
            messages: {
                preferOmitIndexSignature:
                    "Prefer `{{replacement}}` from type-fest over `{{alias}}`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-omit-index-signature",
    });

/**
 * Default export for the `prefer-type-fest-omit-index-signature` rule module.
 */
export default preferTypeFestOmitIndexSignatureRule;

