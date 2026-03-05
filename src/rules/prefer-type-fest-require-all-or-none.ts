/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-require-all-or-none`.
 */
import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { RULE_DOCS_URL_BASE } from "../_internal/rule-docs-url.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const RULE_DOCS_URL = `${RULE_DOCS_URL_BASE}/prefer-type-fest-require-all-or-none`;

const requireAllOrNoneAliasReplacements = {
    AllOrNone: "RequireAllOrNone",
    AllOrNothing: "RequireAllOrNone",
} as const;

/**
 * ESLint rule definition for `prefer-type-fest-require-all-or-none`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestRequireAllOrNoneRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const importedAliasMatches = collectImportedTypeAliasMatches(
                context.sourceCode,
                requireAllOrNoneAliasReplacements
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

                    reportWithOptionalFix({
                        context,
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                        fix: aliasReplacementFix,
                        messageId: "preferRequireAllOrNone",
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
                    "require TypeFest RequireAllOrNone over imported aliases such as AllOrNone/AllOrNothing.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["type-fest/types"]',
                ],
                url: RULE_DOCS_URL,
            },
            fixable: "code",
            messages: {
                preferRequireAllOrNone:
                    "Prefer `{{replacement}}` from type-fest to require all-or-none key groups instead of legacy alias `{{alias}}`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-require-all-or-none",
    });

/**
 * Default export for the `prefer-type-fest-require-all-or-none` rule module.
 */
export default preferTypeFestRequireAllOrNoneRule;
