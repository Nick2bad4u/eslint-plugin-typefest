/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-require-exactly-one`.
 */
import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const requireExactlyOneAliasReplacements = {
    OneOf: "RequireExactlyOne",
    RequireOnlyOne: "RequireExactlyOne",
} as const;

/**
 * ESLint rule definition for `prefer-type-fest-require-exactly-one`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestRequireExactlyOneRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            const importedAliasMatches = collectImportedTypeAliasMatches(
                context.sourceCode,
                requireExactlyOneAliasReplacements
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
                        ...(aliasReplacementFix === null
                            ? {}
                            : { fix: aliasReplacementFix }),
                        messageId: "preferRequireExactlyOne",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest RequireExactlyOne over imported aliases such as OneOf/RequireOnlyOne.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["type-fest/types"]',
                ],
                url: "https://eslint-plugin-typefest.nick2bad4u.com/rules/prefer-type-fest-require-exactly-one",
            },
            fixable: "code",
            messages: {
                preferRequireExactlyOne:
                    "Prefer `{{replacement}}` from type-fest to require exactly one key from a group instead of legacy alias `{{alias}}`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-require-exactly-one",
    });

/**
 * Default export for the `prefer-type-fest-require-exactly-one` rule module.
 */
export default preferTypeFestRequireExactlyOneRule;
