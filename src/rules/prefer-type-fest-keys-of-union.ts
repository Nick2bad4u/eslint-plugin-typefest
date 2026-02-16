import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const keysOfUnionAliasReplacements = {
    AllKeys: "KeysOfUnion",
} as const;

const preferTypeFestKeysOfUnionRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-keys-of-union",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest KeysOfUnion over imported aliases such as AllKeys.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-keys-of-union.md",
            },
            schema: [],
            messages: {
                preferKeysOfUnion:
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
                keysOfUnionAliasReplacements
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
                        messageId: "preferKeysOfUnion",
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                    });
                },
            };
        },
    });

export default preferTypeFestKeysOfUnionRule;
