/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-tuple-of`.
 */
import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const tupleOfAliasReplacements = {
    ReadonlyTuple: "Readonly<TupleOf<Length, Element>>",
} as const;

const preferTypeFestTupleOfRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
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
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                        messageId: "preferTupleOf",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require Readonly<TupleOf<Length, Element>> over imported ReadonlyTuple aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-tuple-of.md",
            },
            messages: {
                preferTupleOf:
                    "Prefer `{{replacement}}` from type-fest over `{{alias}}`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-tuple-of",
    });

export default preferTypeFestTupleOfRule;
