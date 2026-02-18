/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-arrayable`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const ARRAY_TYPE_NAME = "Array";

/**
 * Check whether the input is identifier type reference.
 *
 * @param node - Value to inspect.
 * @param expectedTypeName - Value to inspect.
 *
 * @returns `true` when the value is identifier type reference; otherwise `false`.
 */

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

/**
 * GetArrayTypeReferenceElementType helper.
 *
 * @param node - Value to inspect.
 *
 * @returns GetArrayTypeReferenceElementType helper result.
 */

const getArrayTypeReferenceElementType = (
    node: TSESTree.TypeNode
): null | TSESTree.TypeNode => {
    if (!isIdentifierTypeReference(node, ARRAY_TYPE_NAME)) {
        return null;
    }

    const typeArguments = node.typeArguments?.params ?? [];
    if (typeArguments.length !== 1) {
        return null;
    }

    const [firstTypeArgument] = typeArguments;
    return firstTypeArgument ?? null;
};

/**
 * NormalizeTypeNodeText helper.
 *
 * @param sourceCode - Value to inspect.
 * @param node - Value to inspect.
 *
 * @returns NormalizeTypeNodeText helper result.
 */

const normalizeTypeNodeText = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: TSESTree.TypeNode
): string => sourceCode.getText(node).replaceAll(/\s+/g, "");

/**
 * Check whether has arrayable shape.
 *
 * @param sourceCode - Value to inspect.
 * @param node - Value to inspect.
 *
 * @returns `true` when has arrayable shape; otherwise `false`.
 */

const hasArrayableShape = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: TSESTree.TSUnionType
): boolean => {
    const unionTypes = node.types;
    if (unionTypes.length !== 2) {
        return false;
    }

    const [firstUnionType, secondUnionType] = unionTypes;
    if (!firstUnionType || !secondUnionType) {
        return false;
    }

    if (firstUnionType.type === "TSArrayType") {
        return (
            normalizeTypeNodeText(sourceCode, firstUnionType.elementType) ===
            normalizeTypeNodeText(sourceCode, secondUnionType)
        );
    }

    if (secondUnionType.type === "TSArrayType") {
        return (
            normalizeTypeNodeText(sourceCode, secondUnionType.elementType) ===
            normalizeTypeNodeText(sourceCode, firstUnionType)
        );
    }

    const firstArrayElementType =
        getArrayTypeReferenceElementType(firstUnionType);
    if (firstArrayElementType) {
        return (
            normalizeTypeNodeText(sourceCode, firstArrayElementType) ===
            normalizeTypeNodeText(sourceCode, secondUnionType)
        );
    }

    const secondArrayElementType =
        getArrayTypeReferenceElementType(secondUnionType);
    if (secondArrayElementType) {
        return (
            normalizeTypeNodeText(sourceCode, secondArrayElementType) ===
            normalizeTypeNodeText(sourceCode, firstUnionType)
        );
    }

    return false;
};

/**
 * ESLint rule definition for `prefer-type-fest-arrayable`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestArrayableRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            const { sourceCode } = context;

            return {
                TSUnionType(node) {
                    if (!hasArrayableShape(sourceCode, node)) {
                        return;
                    }

                    context.report({
                        messageId: "preferArrayable",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest Arrayable over T | T[] and T | Array<T> unions.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-arrayable.md",
            },
            messages: {
                preferArrayable:
                    "Prefer `Arrayable<T>` from type-fest over `T | T[]` or `T | Array<T>` unions.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-arrayable",
    });

/**
 * Default export for the `prefer-type-fest-arrayable` rule module.
 */
export default preferTypeFestArrayableRule;

