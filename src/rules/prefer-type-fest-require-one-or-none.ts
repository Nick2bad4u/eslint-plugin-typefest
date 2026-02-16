import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const requireOneOrNoneAliasReplacements = {
    AtMostOne: "RequireOneOrNone",
} as const;

const preferTypeFestRequireOneOrNoneRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-require-one-or-none",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest RequireOneOrNone over imported aliases such as AtMostOne.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-require-one-or-none.md",
            },
            schema: [],
            messages: {
                preferRequireOneOrNone:
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
                requireOneOrNoneAliasReplacements
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
                        messageId: "preferRequireOneOrNone",
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                    });
                },
            };
        },
    });

export default preferTypeFestRequireOneOrNoneRule;
