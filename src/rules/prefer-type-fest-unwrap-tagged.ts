import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const unwrapTaggedAliasReplacements = {
    UnwrapOpaque: "UnwrapTagged",
} as const;

const preferTypeFestUnwrapTaggedRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-unwrap-tagged",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest UnwrapTagged over imported aliases such as UnwrapOpaque.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-unwrap-tagged.md",
            },
            schema: [],
            messages: {
                preferUnwrapTagged:
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
                unwrapTaggedAliasReplacements
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
                        messageId: "preferUnwrapTagged",
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                    });
                },
            };
        },
    });

export default preferTypeFestUnwrapTaggedRule;
