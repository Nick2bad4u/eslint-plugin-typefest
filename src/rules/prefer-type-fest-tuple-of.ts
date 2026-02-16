import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const tupleOfAliasReplacements = {
    ReadonlyTuple: "Readonly<TupleOf<Length, Element>>",
} as const;

const preferTypeFestTupleOfRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-tuple-of",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require Readonly<TupleOf<Length, Element>> over imported ReadonlyTuple aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-tuple-of.md",
            },
            schema: [],
            messages: {
                preferTupleOf:
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
                tupleOfAliasReplacements
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
                        messageId: "preferTupleOf",
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                    });
                },
            };
        },
    });

export default preferTypeFestTupleOfRule;
