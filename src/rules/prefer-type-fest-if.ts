/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-if`.
 */
import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const ifAliasReplacements = {
    IfAny: "IsAny",
    IfEmptyObject: "IsEmptyObject",
    IfNever: "IsNever",
    IfNull: "IsNull",
    IfUnknown: "IsUnknown",
} as const;

/**
 * ESLint rule definition for `prefer-type-fest-if`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestIfRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            const importedAliasMatches = collectImportedTypeAliasMatches(
                context.sourceCode,
                ifAliasReplacements
            );
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                "type-fest"
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

                    const aliasReplacementFix =
                        createSafeTypeReferenceReplacementFix(
                            node,
                            importedAliasMatch.replacementName,
                            typeFestDirectImports
                        );

                    context.report({
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                        ...(aliasReplacementFix
                            ? { fix: aliasReplacementFix }
                            : {}),
                        messageId: "preferTypeFestIf",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest If + Is* utilities over deprecated If* aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-if.md",
            },
            fixable: "code",
            messages: {
                preferTypeFestIf:
                    "`{{alias}}` is deprecated in type-fest. Prefer `If` combined with `{{replacement}}`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-if",
    });

/**
 * Default export for the `prefer-type-fest-if` rule module.
 */
export default preferTypeFestIfRule;
