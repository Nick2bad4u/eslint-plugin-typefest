/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-json-array`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const ARRAY_TYPE_NAME = "Array";
const JSON_VALUE_TYPE_NAME = "JsonValue";
const READONLY_ARRAY_TYPE_NAME = "ReadonlyArray";

/**
 * Check whether is identifier type reference.
 *
 * @param node - Input value for node.
 * @param expectedTypeName - Input value for expectedTypeName.
 *
 * @returns `true` when is identifier type reference; otherwise `false`.
 */

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

/**
 * Check whether is json value type.
 *
 * @param node - Input value for node.
 *
 * @returns `true` when is json value type; otherwise `false`.
 */

const isJsonValueType = (node: TSESTree.TypeNode): boolean =>
    isIdentifierTypeReference(node, JSON_VALUE_TYPE_NAME);

/**
 * Check whether is json value array type.
 *
 * @param node - Input value for node.
 *
 * @returns `true` when is json value array type; otherwise `false`.
 */

const isJsonValueArrayType = (node: TSESTree.TypeNode): boolean =>
    node.type === "TSArrayType" && isJsonValueType(node.elementType);

/**
 * Check whether is readonly json value array type.
 *
 * @param node - Input value for node.
 *
 * @returns `true` when is readonly json value array type; otherwise `false`.
 */

const isReadonlyJsonValueArrayType = (node: TSESTree.TypeNode): boolean => {
    if (node.type !== "TSTypeOperator" || node.operator !== "readonly") {
        return false;
    }

    const { typeAnnotation } = node;
    if (typeAnnotation?.type !== "TSArrayType") {
        return false;
    }

    return isJsonValueType(typeAnnotation.elementType);
};

/**
 * Check whether is generic json value array type.
 *
 * @param node - Input value for node.
 *
 * @returns `true` when is generic json value array type; otherwise `false`.
 */

const isGenericJsonValueArrayType = (node: TSESTree.TypeNode): boolean => {
    if (!isIdentifierTypeReference(node, ARRAY_TYPE_NAME)) {
        return false;
    }

    const typeArguments = node.typeArguments?.params ?? [];
    if (typeArguments.length !== 1) {
        return false;
    }

    const [firstTypeArgument] = typeArguments;
    return firstTypeArgument ? isJsonValueType(firstTypeArgument) : false;
};

/**
 * Check whether is generic readonly json value array type.
 *
 * @param node - Input value for node.
 *
 * @returns `true` when is generic readonly json value array type; otherwise `false`.
 */

const isGenericReadonlyJsonValueArrayType = (
    node: TSESTree.TypeNode
): boolean => {
    if (!isIdentifierTypeReference(node, READONLY_ARRAY_TYPE_NAME)) {
        return false;
    }

    const typeArguments = node.typeArguments?.params ?? [];
    if (typeArguments.length !== 1) {
        return false;
    }

    const [firstTypeArgument] = typeArguments;
    return firstTypeArgument ? isJsonValueType(firstTypeArgument) : false;
};

/**
 * Check whether has json array union shape.
 *
 * @param node - Input value for node.
 *
 * @returns `true` when has json array union shape; otherwise `false`.
 */

const hasJsonArrayUnionShape = (node: TSESTree.TSUnionType): boolean => {
    if (node.types.length !== 2) {
        return false;
    }

    const [firstType, secondType] = node.types;
    if (!firstType || !secondType) {
        return false;
    }

    const firstNativePair =
        isJsonValueArrayType(firstType) &&
        isReadonlyJsonValueArrayType(secondType);
    const secondNativePair =
        isReadonlyJsonValueArrayType(firstType) &&
        isJsonValueArrayType(secondType);

    if (firstNativePair || secondNativePair) {
        return true;
    }

    const firstGenericPair =
        isGenericJsonValueArrayType(firstType) &&
        isGenericReadonlyJsonValueArrayType(secondType);
    const secondGenericPair =
        isGenericReadonlyJsonValueArrayType(firstType) &&
        isGenericJsonValueArrayType(secondType);

    return firstGenericPair || secondGenericPair;
};

/**
 * ESLint rule definition for `prefer-type-fest-json-array`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestJsonArrayRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                TSUnionType(node) {
                    if (!hasJsonArrayUnionShape(node)) {
                        return;
                    }

                    context.report({
                        messageId: "preferJsonArray",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest JsonArray over explicit JsonValue[] | readonly JsonValue[] style unions.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-json-array.md",
            },
            messages: {
                preferJsonArray:
                    "Prefer `JsonArray` from type-fest over explicit JsonValue array unions.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-json-array",
    });

/**
 * Default export for the `prefer-type-fest-json-array` rule module.
 */
export default preferTypeFestJsonArrayRule;

