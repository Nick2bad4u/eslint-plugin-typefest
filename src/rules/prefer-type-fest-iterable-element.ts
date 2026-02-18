/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-iterable-element`.
 */
import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const iterableElementAliasReplacements = {
    SetElement: "IterableElement",
    SetEntry: "IterableElement",
    SetValues: "IterableElement",
} as const;

/**
 * ESLint rule definition for `prefer-type-fest-iterable-element`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestIterableElementRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            const importedAliasMatches = collectImportedTypeAliasMatches(
                context.sourceCode,
                iterableElementAliasReplacements
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
                        messageId: "preferIterableElement",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest IterableElement over imported aliases such as SetElement/SetEntry/SetValues.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-iterable-element.md",
            },
            messages: {
                preferIterableElement:
                    "Prefer `{{replacement}}` from type-fest over `{{alias}}`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-iterable-element",
    });

/**
 * Default export for the `prefer-type-fest-iterable-element` rule module.
 */
export default preferTypeFestIterableElementRule;

