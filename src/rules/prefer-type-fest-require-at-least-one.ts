import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const requireAtLeastOneAliasReplacements = {
    AtLeastOne: "RequireAtLeastOne",
} as const;

const preferTypeFestRequireAtLeastOneRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-require-at-least-one",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest RequireAtLeastOne over imported aliases such as AtLeastOne.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-require-at-least-one.md",
            },
            schema: [],
            messages: {
                preferRequireAtLeastOne:
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
                requireAtLeastOneAliasReplacements
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
                        messageId: "preferRequireAtLeastOne",
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                    });
                },
            };
        },
    });

export default preferTypeFestRequireAtLeastOneRule;
