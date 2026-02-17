import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const setRequiredAliasReplacements = {
    RequiredBy: "SetRequired",
} as const;

const preferTypeFestSetRequiredRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-set-required",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest SetRequired over imported aliases such as RequiredBy.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-set-required.md",
            },
            schema: [],
            messages: {
                preferSetRequired:
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
                setRequiredAliasReplacements
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
                        messageId: "preferSetRequired",
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                    });
                },
            };
        },
    });

export default preferTypeFestSetRequiredRule;
