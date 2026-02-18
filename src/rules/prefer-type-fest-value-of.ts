/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-value-of`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

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

                    context.report({
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

