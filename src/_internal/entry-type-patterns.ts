import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
/**
 * @packageDocumentation
 * Shared AST matchers for object entry-pair type aliases.
 */
import { arrayAt, arrayFirst } from "ts-extras";

import { areEquivalentTypeNodes } from "./normalize-expression-text.js";

const ARRAY_TYPE_NAME = "Array";

const getKeyofTargetType = (
    node: Readonly<TSESTree.TypeNode>
): TSESTree.TypeNode | undefined =>
    node.type === AST_NODE_TYPES.TSTypeOperator && node.operator === "keyof"
        ? node.typeAnnotation
        : undefined;

const getObjectEntryTargetType = (
    node: Readonly<TSESTree.TSTupleType>
): TSESTree.TypeNode | undefined => {
    if (node.elementTypes.length !== 2) {
        return undefined;
    }

    const keyElement = arrayFirst(node.elementTypes);
    const valueElement = arrayAt(node.elementTypes, 1);

    if (
        !keyElement ||
        valueElement?.type !== AST_NODE_TYPES.TSIndexedAccessType
    ) {
        return undefined;
    }

    const keyTargetType = getKeyofTargetType(keyElement);
    const valueKeyTargetType = getKeyofTargetType(valueElement.indexType);

    if (
        !keyTargetType ||
        !valueKeyTargetType ||
        !areEquivalentTypeNodes(valueElement.objectType, keyTargetType) ||
        !areEquivalentTypeNodes(valueKeyTargetType, keyTargetType)
    ) {
        return undefined;
    }

    return keyTargetType;
};

/**
 * Extract `T` from `[keyof T, T[keyof T]]`.
 */
export const getEntryEquivalentArgumentText = ({
    node,
    sourceCode,
}: Readonly<{
    node: Readonly<TSESTree.TypeNode>;
    sourceCode: Readonly<TSESLint.SourceCode>;
}>): null | string => {
    if (node.type !== AST_NODE_TYPES.TSTupleType) {
        return null;
    }

    const targetType = getObjectEntryTargetType(node);

    return targetType ? sourceCode.getText(targetType) : null;
};

/**
 * Extract `T` from `Array<[keyof T, T[keyof T]]>` or `[keyof T, T[keyof T]][]`.
 */
export const getEntriesEquivalentArgumentText = ({
    node,
    sourceCode,
}: Readonly<{
    node: Readonly<TSESTree.TypeNode>;
    sourceCode: Readonly<TSESLint.SourceCode>;
}>): null | string => {
    if (node.type === AST_NODE_TYPES.TSArrayType) {
        return getEntryEquivalentArgumentText({
            node: node.elementType,
            sourceCode,
        });
    }

    if (
        node.type !== AST_NODE_TYPES.TSTypeReference ||
        node.typeName.type !== AST_NODE_TYPES.Identifier ||
        node.typeName.name !== ARRAY_TYPE_NAME
    ) {
        return null;
    }

    const arrayElementType = arrayFirst(node.typeArguments?.params ?? []);

    return arrayElementType
        ? getEntryEquivalentArgumentText({
              node: arrayElementType,
              sourceCode,
          })
        : null;
};
