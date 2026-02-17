import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const omitIndexSignatureAliasReplacements = {
    RemoveIndexSignature: "OmitIndexSignature",
} as const;

const preferTypeFestOmitIndexSignatureRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-omit-index-signature",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest OmitIndexSignature over imported aliases such as RemoveIndexSignature.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-omit-index-signature.md",
            },
            schema: [],
            messages: {
                preferOmitIndexSignature:
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
                omitIndexSignatureAliasReplacements
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
                        messageId: "preferOmitIndexSignature",
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                    });
                },
            };
        },
    });

export default preferTypeFestOmitIndexSignatureRule;
