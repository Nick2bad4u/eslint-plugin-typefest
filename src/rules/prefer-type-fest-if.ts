import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const ifAliasReplacements = {
    IfAny: "IsAny",
    IfEmptyObject: "IsEmptyObject",
    IfNever: "IsNever",
    IfNull: "IsNull",
    IfUnknown: "IsUnknown",
} as const;

const preferTypeFestIfRule: ReturnType<typeof createTypedRule> = createTypedRule(
    {
        name: "prefer-type-fest-if",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest If + Is* utilities over deprecated If* aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-if.md",
            },
            schema: [],
            messages: {
                preferTypeFestIf:
                    "`{{alias}}` is deprecated in type-fest. Prefer `If` combined with `{{replacement}}`.",
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
                ifAliasReplacements
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
                        messageId: "preferTypeFestIf",
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                    });
                },
            };
        },
    }
);

export default preferTypeFestIfRule;
