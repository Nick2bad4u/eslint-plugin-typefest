import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { arrayFirst } from "ts-extras";

/**
 * @packageDocumentation
 * Shared AST pattern helpers for TypeFest `*KeysOf` extraction rules.
 */
import { setContainsValue } from "./set-membership.js";
import { isBooleanLiteralType } from "./type-guard-conditional-patterns.js";

const getSingleTypeArgument = (
    node: Readonly<TSESTree.TSTypeReference>
): TSESTree.TypeNode | undefined => {
    const typeArguments = node.typeArguments?.params;

    return typeArguments?.length === 1 ? arrayFirst(typeArguments) : undefined;
};

const getTwoTypeArguments = (
    node: Readonly<TSESTree.TSTypeReference>
): readonly [TSESTree.TypeNode, TSESTree.TypeNode] | undefined => {
    const typeArguments = node.typeArguments?.params;

    if (typeArguments?.length !== 2) {
        return undefined;
    }

    const [firstType, secondType] = typeArguments;

    return firstType && secondType ? [firstType, secondType] : undefined;
};

const isTypeTextEqual = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    leftNode: Readonly<TSESTree.TypeNode>,
    rightNode: Readonly<TSESTree.TypeNode>
): boolean => sourceCode.getText(leftNode) === sourceCode.getText(rightNode);

const isIdentifierTypeNamed = (
    node: Readonly<TSESTree.TypeNode>,
    name: string
): boolean =>
    node.type === AST_NODE_TYPES.TSTypeReference &&
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    node.typeName.name === name &&
    node.typeArguments === undefined;

const isKeyofType = (
    node: Readonly<TSESTree.TypeNode>,
    sourceCode: Readonly<TSESLint.SourceCode>,
    inputType: Readonly<TSESTree.TypeNode>
): boolean =>
    node.type === AST_NODE_TYPES.TSTypeOperator &&
    node.operator === "keyof" &&
    node.typeAnnotation !== undefined &&
    isTypeTextEqual(sourceCode, node.typeAnnotation, inputType);

const isDirectTypeReference = (
    node: Readonly<TSESTree.TSTypeReference>,
    localNames: ReadonlySet<string>
): boolean =>
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    setContainsValue(localNames, node.typeName.name);

const isNamespaceTypeReference = (
    node: Readonly<TSESTree.TSTypeReference>,
    typeFestNamespaceImportNames: ReadonlySet<string>,
    importedTypeName: string
): boolean =>
    node.typeName.type === AST_NODE_TYPES.TSQualifiedName &&
    node.typeName.left.type === AST_NODE_TYPES.Identifier &&
    setContainsValue(typeFestNamespaceImportNames, node.typeName.left.name) &&
    node.typeName.right.name === importedTypeName;

const isImportedTypeReference = (
    node: Readonly<TSESTree.TSTypeReference>,
    localNames: ReadonlySet<string>,
    typeFestNamespaceImportNames: ReadonlySet<string>,
    importedTypeName: string
): boolean =>
    isDirectTypeReference(node, localNames) ||
    isNamespaceTypeReference(
        node,
        typeFestNamespaceImportNames,
        importedTypeName
    );

const getDistributedInputType = (
    node: Readonly<TSESTree.TSConditionalType>
): TSESTree.TypeNode | undefined =>
    node.extendsType.type === AST_NODE_TYPES.TSUnknownKeyword &&
    node.falseType.type === AST_NODE_TYPES.TSNeverKeyword
        ? node.checkType
        : undefined;

const getKeyofMappedTypeOperand = (
    node: Readonly<TSESTree.TypeNode>
): TSESTree.TSMappedType | undefined => {
    const typeAnnotation =
        node.type === AST_NODE_TYPES.TSTypeOperator && node.operator === "keyof"
            ? node.typeAnnotation
            : undefined;

    return typeAnnotation?.type === AST_NODE_TYPES.TSMappedType
        ? typeAnnotation
        : undefined;
};

const getMappedAndKeyofOperands = (
    node: Readonly<TSESTree.TypeNode>,
    sourceCode: Readonly<TSESLint.SourceCode>,
    inputType: Readonly<TSESTree.TypeNode>
):
    | Readonly<{
          keyofInputType: TSESTree.TSTypeOperator;
          mappedType: TSESTree.TSMappedType;
      }>
    | undefined => {
    if (
        node.type !== AST_NODE_TYPES.TSIntersectionType ||
        node.types.length !== 2
    ) {
        return undefined;
    }

    const [firstType, secondType] = node.types;

    if (!firstType || !secondType) {
        return undefined;
    }

    const firstMappedType = getKeyofMappedTypeOperand(firstType);
    if (
        firstMappedType &&
        isKeyofType(secondType, sourceCode, inputType) &&
        secondType.type === AST_NODE_TYPES.TSTypeOperator
    ) {
        return {
            keyofInputType: secondType,
            mappedType: firstMappedType,
        };
    }

    const secondMappedType = getKeyofMappedTypeOperand(secondType);
    if (
        secondMappedType &&
        isKeyofType(firstType, sourceCode, inputType) &&
        firstType.type === AST_NODE_TYPES.TSTypeOperator
    ) {
        return {
            keyofInputType: firstType,
            mappedType: secondMappedType,
        };
    }

    return undefined;
};

const isMatchingMappedKey = (
    node: Readonly<TSESTree.TSMappedType>,
    sourceCode: Readonly<TSESLint.SourceCode>,
    inputType: Readonly<TSESTree.TypeNode>
): boolean =>
    isKeyofType(node.constraint, sourceCode, inputType) &&
    node.typeAnnotation?.type === AST_NODE_TYPES.TSNeverKeyword;

const isMatchingMappedKeyNameType = (
    node: Readonly<TSESTree.TSConditionalType>,
    localGuardNames: ReadonlySet<string>,
    typeFestNamespaceImportNames: ReadonlySet<string>,
    guardTypeName: string,
    sourceCode: Readonly<TSESLint.SourceCode>,
    inputType: Readonly<TSESTree.TypeNode>,
    mappedKeyName: string
): boolean => {
    if (
        !isBooleanLiteralType(node.extendsType, false) ||
        node.trueType.type !== AST_NODE_TYPES.TSNeverKeyword ||
        !isIdentifierTypeNamed(node.falseType, mappedKeyName) ||
        node.checkType.type !== AST_NODE_TYPES.TSTypeReference ||
        !isImportedTypeReference(
            node.checkType,
            localGuardNames,
            typeFestNamespaceImportNames,
            guardTypeName
        )
    ) {
        return false;
    }

    const typeArguments = getTwoTypeArguments(node.checkType);

    if (!typeArguments) {
        return false;
    }

    const [inputArgument, keyArgument] = typeArguments;

    return (
        isTypeTextEqual(sourceCode, inputArgument, inputType) &&
        isIdentifierTypeNamed(keyArgument, mappedKeyName)
    );
};

/**
 * Extract `T` from TypeFest's canonical mapped-key extraction composition:
 *
 * A distributive conditional whose true branch intersects `keyof T` with a
 * mapped type filtered through the corresponding TypeFest key guard.
 */
export const getMappedKeyExtractionInputType = (
    node: Readonly<TSESTree.TSConditionalType>,
    localGuardNames: ReadonlySet<string>,
    typeFestNamespaceImportNames: ReadonlySet<string>,
    guardTypeName: string,
    sourceCode: Readonly<TSESLint.SourceCode>
): TSESTree.TypeNode | undefined => {
    const inputType = getDistributedInputType(node);

    if (!inputType) {
        return undefined;
    }

    const operands = getMappedAndKeyofOperands(
        node.trueType,
        sourceCode,
        inputType
    );

    if (
        !operands ||
        !isMatchingMappedKey(operands.mappedType, sourceCode, inputType)
    ) {
        return undefined;
    }

    const mappedKeyName = operands.mappedType.key.name;
    const nameType = operands.mappedType.nameType;

    return nameType?.type === AST_NODE_TYPES.TSConditionalType &&
        isMatchingMappedKeyNameType(
            nameType,
            localGuardNames,
            typeFestNamespaceImportNames,
            guardTypeName,
            sourceCode,
            inputType,
            mappedKeyName
        )
        ? inputType
        : undefined;
};

/**
 * Extract `T` from TypeFest's canonical exclusion-based key extraction
 * composition:
 *
 * `T extends unknown ? Exclude<keyof T, KeysOf<T>> : never`
 */
export const getExcludeKeyExtractionInputType = (
    node: Readonly<TSESTree.TSConditionalType>,
    localKeysOfNames: ReadonlySet<string>,
    typeFestNamespaceImportNames: ReadonlySet<string>,
    keysOfTypeName: string,
    sourceCode: Readonly<TSESLint.SourceCode>
): TSESTree.TypeNode | undefined => {
    const inputType = getDistributedInputType(node);

    if (
        !inputType ||
        node.trueType.type !== AST_NODE_TYPES.TSTypeReference ||
        node.trueType.typeName.type !== AST_NODE_TYPES.Identifier ||
        node.trueType.typeName.name !== "Exclude"
    ) {
        return undefined;
    }

    const typeArguments = getTwoTypeArguments(node.trueType);

    if (!typeArguments) {
        return undefined;
    }

    const [keyofInputType, keysOfType] = typeArguments;

    if (
        !isKeyofType(keyofInputType, sourceCode, inputType) ||
        keysOfType.type !== AST_NODE_TYPES.TSTypeReference ||
        !isImportedTypeReference(
            keysOfType,
            localKeysOfNames,
            typeFestNamespaceImportNames,
            keysOfTypeName
        )
    ) {
        return undefined;
    }

    const keysOfInputType = getSingleTypeArgument(keysOfType);

    return keysOfInputType &&
        isTypeTextEqual(sourceCode, keysOfInputType, inputType)
        ? inputType
        : undefined;
};
