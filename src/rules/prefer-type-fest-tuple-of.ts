/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-tuple-of`.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    isTypeParameterNameShadowed,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const tupleOfAliasReplacements = {
    ReadonlyTuple: "Readonly<TupleOf<Length, Element>>",
    Tuple: "TupleOf<Length, Element>",
} as const;

const preferTypeFestTupleOfRule = createTypedRule({
    create(context) {
        const filePath = context.filename;

        if (isTestFilePath(filePath)) {
            return {};
        }

        const importedAliasMatches = collectImportedTypeAliasMatches(
            context.sourceCode,
            tupleOfAliasReplacements
        );
        const typeFestDirectImports = collectDirectNamedImportsFromSource(
            context.sourceCode,
            "type-fest"
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

                const tupleTypeParameters = node.typeArguments?.params;
                let tupleOfSuggestion:
                    | null
                    | readonly {
                          readonly fix: TSESLint.ReportFixFunction;
                          readonly messageId: "suggestTupleOfReplacement";
                      }[] = null;

                if (
                    tupleTypeParameters?.length === 2 &&
                    typeFestDirectImports.has("TupleOf") &&
                    !isTypeParameterNameShadowed(node, "TupleOf")
                ) {
                    const [elementType, lengthType] = tupleTypeParameters;
                    const elementTypeText =
                        context.sourceCode.getText(elementType);
                    const lengthTypeText =
                        context.sourceCode.getText(lengthType);

                    tupleOfSuggestion = [
                        {
                            fix(fixer: TSESLint.RuleFixer) {
                                return fixer.replaceText(
                                    node,
                                    `Readonly<TupleOf<${lengthTypeText}, ${elementTypeText}>>`
                                );
                            },
                            messageId: "suggestTupleOfReplacement",
                        },
                    ];
                }

                context.report({
                    data: {
                        alias: importedAliasMatch.importedName,
                        replacement: importedAliasMatch.replacementName,
                    },
                    messageId: "preferTupleOf",
                    node,
                    ...(tupleOfSuggestion === null
                        ? {}
                        : { suggest: tupleOfSuggestion }),
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        docs: {
            description:
                "require TypeFest TupleOf over imported aliases such as ReadonlyTuple and Tuple.",
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-tuple-of.md",
        },
        hasSuggestions: true,
        messages: {
            preferTupleOf:
                "Prefer `{{replacement}}` from type-fest over `{{alias}}`.",
            suggestTupleOfReplacement:
                "Replace with `Readonly<TupleOf<...>>` using type-fest `TupleOf`.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "prefer-type-fest-tuple-of",
});

export default preferTypeFestTupleOfRule;
