import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const conditionalPickAliasReplacements = {
    PickByTypes: "ConditionalPick",
} as const;

const preferTypeFestConditionalPickRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-conditional-pick",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest ConditionalPick over imported aliases such as PickByTypes.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-conditional-pick.md",
            },
            schema: [],
            messages: {
                preferConditionalPick:
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
                conditionalPickAliasReplacements
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
                        messageId: "preferConditionalPick",
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                    });
                },
            };
        },
    });

export default preferTypeFestConditionalPickRule;
