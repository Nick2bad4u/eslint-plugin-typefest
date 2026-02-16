import { type TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const ARRAY_TYPE_NAME = "Array";
const JSON_VALUE_TYPE_NAME = "JsonValue";
const READONLY_ARRAY_TYPE_NAME = "ReadonlyArray";

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

const isJsonValueType = (node: TSESTree.TypeNode): boolean =>
    isIdentifierTypeReference(node, JSON_VALUE_TYPE_NAME);

const isJsonValueArrayType = (node: TSESTree.TypeNode): boolean =>
    node.type === "TSArrayType" && isJsonValueType(node.elementType);

const isReadonlyJsonValueArrayType = (node: TSESTree.TypeNode): boolean => {
    if (node.type !== "TSTypeOperator" || node.operator !== "readonly") {
        return false;
    }

    const typeAnnotation = node.typeAnnotation;
    if (!typeAnnotation || typeAnnotation.type !== "TSArrayType") {
        return false;
    }

    return isJsonValueType(typeAnnotation.elementType);
};

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

const preferTypeFestJsonArrayRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-json-array",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest JsonArray over explicit JsonValue[] | readonly JsonValue[] style unions.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-json-array.md",
            },
            schema: [],
            messages: {
                preferJsonArray:
                    "Prefer `JsonArray` from type-fest over explicit JsonValue array unions.",
            },
        },
        defaultOptions: [],
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
                        node,
                        messageId: "preferJsonArray",
                    });
                },
            };
        },
    });

export default preferTypeFestJsonArrayRule;
