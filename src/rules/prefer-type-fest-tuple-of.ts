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
import { RULE_DOCS_URL_BASE } from "../_internal/rule-docs-url.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const RULE_DOCS_URL = `${RULE_DOCS_URL_BASE}/prefer-type-fest-tuple-of`;

/**
 * Legacy tuple aliases this rule normalizes to `TupleOf` forms.
 */
const tupleOfAliasReplacements = {
    ReadonlyTuple: "Readonly<TupleOf<Length, Element>>",
    Tuple: "TupleOf<Length, Element>",
} as const;

/**
 * Builds replacement text that preserves readonly semantics for legacy tuple
 * aliases.
 *
 * @param importedAliasName - Alias name detected in source.
 * @param lengthTypeText - Serialized tuple length type argument.
 * @param elementTypeText - Serialized tuple element type argument.
 *
 * @returns Replacement text using canonical `TupleOf` syntax.
 */
const createTupleOfReplacementText = (
    importedAliasName: string,
    lengthTypeText: string,
    elementTypeText: string
): string =>
    importedAliasName === "ReadonlyTuple"
        ? `Readonly<TupleOf<${lengthTypeText}, ${elementTypeText}>>`
        : `TupleOf<${lengthTypeText}, ${elementTypeText}>`;

/**
 * ESLint rule definition for `prefer-type-fest-tuple-of`.
 *
 * @remarks
 * Defines metadata, diagnostics, and fixes for replacing legacy tuple aliases
 * with canonical `TupleOf` forms.
 */
const preferTypeFestTupleOfRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
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

                    reportWithOptionalFix({
                        context,
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
            deprecated: false,
            docs: {
                description:
                    "require TypeFest TupleOf over imported aliases such as ReadonlyTuple and Tuple.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["type-fest/types"]',
                ],
                url: RULE_DOCS_URL,
            },
            fixable: "code",
            messages: {
                preferTupleOf:
                    "Prefer `{{replacement}}` from type-fest to model fixed-length homogeneous tuples instead of legacy alias `{{alias}}`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-tuple-of",
    });

/**
 * Default export for the `prefer-type-fest-tuple-of` rule module.
 */
export default preferTypeFestTupleOfRule;
