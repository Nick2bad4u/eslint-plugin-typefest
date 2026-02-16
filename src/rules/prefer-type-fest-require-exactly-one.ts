import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const requireExactlyOneAliasReplacements = {
    OneOf: "RequireExactlyOne",
    RequireOnlyOne: "RequireExactlyOne",
} as const;

const preferTypeFestRequireExactlyOneRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-require-exactly-one",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest RequireExactlyOne over imported aliases such as OneOf/RequireOnlyOne.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-require-exactly-one.md",
            },
            schema: [],
            messages: {
                preferRequireExactlyOne:
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
                requireExactlyOneAliasReplacements
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
                        messageId: "preferRequireExactlyOne",
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                    });
                },
            };
        },
    });

export default preferTypeFestRequireExactlyOneRule;
