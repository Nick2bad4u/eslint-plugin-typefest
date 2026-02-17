import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const setNonNullableAliasReplacements = {
    NonNullableBy: "SetNonNullable",
} as const;

const preferTypeFestSetNonNullableRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-set-non-nullable",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest SetNonNullable over imported aliases such as NonNullableBy.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-set-non-nullable.md",
            },
            schema: [],
            messages: {
                preferSetNonNullable:
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
                setNonNullableAliasReplacements
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
                        messageId: "preferSetNonNullable",
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                    });
                },
            };
        },
    });

export default preferTypeFestSetNonNullableRule;
