/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-set-readonly`.
 */
import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const setReadonlyAliasReplacements = {
    ReadonlyBy: "SetReadonly",
} as const;

/**
 * ESLint rule definition for `prefer-type-fest-set-readonly`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestSetReadonlyRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            const importedAliasMatches = collectImportedTypeAliasMatches(
                context.sourceCode,
                setReadonlyAliasReplacements
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
                        messageId: "preferSetReadonly",
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
                    "require TypeFest SetReadonly over imported aliases such as ReadonlyBy.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["type-fest/types"]',
                ],
                url: "https://eslint-plugin-typefest.nick2bad4u.com/rules/prefer-type-fest-set-readonly",
            },
            fixable: "code",
            messages: {
                preferSetReadonly:
                    "Prefer `{{replacement}}` from type-fest to mark selected keys readonly instead of legacy alias `{{alias}}`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-set-readonly",
    });

/**
 * Default export for the `prefer-type-fest-set-readonly` rule module.
 */
export default preferTypeFestSetReadonlyRule;
