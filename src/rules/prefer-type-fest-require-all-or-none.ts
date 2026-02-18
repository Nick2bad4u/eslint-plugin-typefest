/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-require-all-or-none`.
 */
import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const requireAllOrNoneAliasReplacements = {
    AllOrNone: "RequireAllOrNone",
    AllOrNothing: "RequireAllOrNone",
} as const;

const preferTypeFestRequireAllOrNoneRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            const importedAliasMatches = collectImportedTypeAliasMatches(
                context.sourceCode,
                requireAllOrNoneAliasReplacements
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
                        messageId: "preferRequireAllOrNone",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest RequireAllOrNone over imported aliases such as AllOrNone/AllOrNothing.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-require-all-or-none.md",
            },
            messages: {
                preferRequireAllOrNone:
                    "Prefer `{{replacement}}` from type-fest over `{{alias}}`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-require-all-or-none",
    });

export default preferTypeFestRequireAllOrNoneRule;
