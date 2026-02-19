/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-unknown-array`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const READONLY_ARRAY_TYPE_NAME = "ReadonlyArray";

/**
 * Check whether the input is identifier type reference.
 *
 * @param node - Value to inspect.
 * @param expectedTypeName - Value to inspect.
 *
 * @returns `true` when the value is identifier type reference; otherwise
 *   `false`.
 */

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

/**
 * Check whether has single unknown type argument.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when has single unknown type argument; otherwise `false`.
 */

const hasSingleUnknownTypeArgument = (
    node: TSESTree.TSTypeReference
): boolean => {
    const typeArguments = node.typeArguments?.params ?? [];

    if (typeArguments.length !== 1) {
        return false;
    }

    const [firstTypeArgument] = typeArguments;
    return firstTypeArgument?.type === "TSUnknownKeyword";
};

/**
 * Check whether the input is readonly unknown array type.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is readonly unknown array type; otherwise
 *   `false`.
 */

const isReadonlyUnknownArrayType = (node: TSESTree.TSTypeOperator): boolean => {
    if (node.operator !== "readonly") {
        return false;
    }

    const { typeAnnotation } = node;
    if (typeAnnotation?.type !== "TSArrayType") {
        return false;
    }

    return typeAnnotation.elementType.type === "TSUnknownKeyword";
};

/**
 * ESLint rule definition for `prefer-type-fest-unknown-array`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestUnknownArrayRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                TSTypeOperator(node) {
                    if (!isReadonlyUnknownArrayType(node)) {
                        return;
                    }

                    context.report({
                        messageId: "preferUnknownArray",
                        node,
                    });
                },
                TSTypeReference(node) {
                    if (
                        !isIdentifierTypeReference(
                            node,
                            READONLY_ARRAY_TYPE_NAME
                        )
                    ) {
                        return;
                    }

                    if (!hasSingleUnknownTypeArgument(node)) {
                        return;
                    }

                    context.report({
                        messageId: "preferUnknownArray",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest UnknownArray over readonly unknown[] and ReadonlyArray<unknown> aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-unknown-array.md",
            },
            messages: {
                preferUnknownArray:
                    "Prefer `UnknownArray` from type-fest over `readonly unknown[]` or `ReadonlyArray<unknown>`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-unknown-array",
    });

/**
 * Default export for the `prefer-type-fest-unknown-array` rule module.
 */
export default preferTypeFestUnknownArrayRule;
