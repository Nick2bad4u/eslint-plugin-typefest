/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-tuple-of`.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeNodeTextReplacementFix,
    isTypeParameterNameShadowed,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const tupleOfAliasReplacements = {
    ReadonlyTuple: "Readonly<TupleOf<Length, Element>>",
    Tuple: "TupleOf<Length, Element>",
} as const;

const createTupleOfReplacementText = (
    importedAliasName: string,
    lengthTypeText: string,
    elementTypeText: string
): string =>
    importedAliasName === "ReadonlyTuple"
        ? `Readonly<TupleOf<${lengthTypeText}, ${elementTypeText}>>`
        : `TupleOf<${lengthTypeText}, ${elementTypeText}>`;

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
                    let fix: null | TSESLint.ReportFixFunction = null;

                    if (tupleTypeParameters?.length === 2) {
                        const [elementType, lengthType] = tupleTypeParameters;
                        const elementTypeText =
                            context.sourceCode.getText(elementType);
                        const lengthTypeText =
                            context.sourceCode.getText(lengthType);
                        const usesReadonlyWrapper =
                            importedAliasMatch.importedName === "ReadonlyTuple";

                        if (
                            !usesReadonlyWrapper ||
                            !isTypeParameterNameShadowed(node, "Readonly")
                        ) {
                            const replacementText =
                                createTupleOfReplacementText(
                                    importedAliasMatch.importedName,
                                    lengthTypeText,
                                    elementTypeText
                                );

                            fix = createSafeTypeNodeTextReplacementFix(
                                node,
                                "TupleOf",
                                replacementText,
                                typeFestDirectImports
                            );
                        }
                    }

                    const reportData = {
                        alias: importedAliasMatch.importedName,
                        replacement: importedAliasMatch.replacementName,
                    };

                    if (fix === null) {
                        context.report({
                            data: reportData,
                            messageId: "preferTupleOf",
                            node,
                        });

                        return;
                    }

                    context.report({
                        data: reportData,
                        fix,
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
                    "require TypeFest TupleOf over imported aliases such as ReadonlyTuple and Tuple.",
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs[\"type-fest/types\"]",
                ],
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-tuple-of.md",
            },
            fixable: "code",
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
