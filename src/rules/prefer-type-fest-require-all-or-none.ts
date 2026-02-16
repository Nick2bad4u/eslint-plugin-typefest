import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const requireAllOrNoneAliasReplacements = {
    AllOrNone: "RequireAllOrNone",
    AllOrNothing: "RequireAllOrNone",
} as const;

const preferTypeFestRequireAllOrNoneRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-require-all-or-none",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest RequireAllOrNone over imported aliases such as AllOrNone/AllOrNothing.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-require-all-or-none.md",
            },
            schema: [],
            messages: {
                preferRequireAllOrNone:
                    "Prefer `{{replacement}}` from type-fest over `{{alias}}`.",
            },
        },
        defaultOptions: [],
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
                        node,
                        messageId: "preferRequireAllOrNone",
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                    });
                },
            };
        },
    });

export default preferTypeFestRequireAllOrNoneRule;
