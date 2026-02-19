/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-value-of`.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    isTypeParameterNameShadowed,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * NormalizeTypeText helper.
 *
 * @param text - Value to inspect.
 *
 * @returns NormalizeTypeText helper result.
 */

const normalizeTypeText = (text: string): string => text.replaceAll(/\s+/g, "");

/**
 * ESLint rule definition for `prefer-type-fest-value-of`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestValueOfRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            const { sourceCode } = context;
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                sourceCode,
                "type-fest"
            );

            return {
                TSIndexedAccessType(node) {
                    if (
                        node.indexType.type !== "TSTypeOperator" ||
                        node.indexType.operator !== "keyof"
                    ) {
                        return;
                    }

                    const keyOfTargetText = normalizeTypeText(
                        sourceCode.getText(node.indexType.typeAnnotation)
                    );
                    const objectTypeText = normalizeTypeText(
                        sourceCode.getText(node.objectType)
                    );

                    if (objectTypeText !== keyOfTargetText) {
                        return;
                    }

                    const fix: null | TSESLint.ReportFixFunction =
                        typeFestDirectImports.has("ValueOf") &&
                        !isTypeParameterNameShadowed(node, "ValueOf")
                            ? (fixer) =>
                                  fixer.replaceText(
                                      node,
                                      `ValueOf<${sourceCode.getText(node.objectType)}>`
                                  )
                            : null;

                    context.report({
                        ...(fix === null ? {} : { fix }),
                        messageId: "preferValueOf",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest ValueOf over direct T[keyof T] indexed-access unions for object value extraction.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-value-of.md",
            },
            fixable: "code",
            messages: {
                preferValueOf:
                    "Prefer `ValueOf<T>` from type-fest over `T[keyof T]` for object value unions.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-value-of",
    });

/**
 * Default export for the `prefer-type-fest-value-of` rule module.
 */
export default preferTypeFestValueOfRule;
