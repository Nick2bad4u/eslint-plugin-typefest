import type { TSESTree } from "@typescript-eslint/utils";

import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { arrayFirst, assertNever } from "ts-extras";

type TupleWrappedGuardTarget = "never" | "null" | "undefined";

const isLiteralTypeWithValue = (
    node: Readonly<TSESTree.TypeNode>,
    value: boolean | number
): boolean =>
    node.type === AST_NODE_TYPES.TSLiteralType &&
    node.literal.type === AST_NODE_TYPES.Literal &&
    node.literal.value === value;

/**
 * Determine whether a type node is the exact boolean literal type requested.
 */
export const isBooleanLiteralType = (
    node: Readonly<TSESTree.TypeNode>,
    value: boolean
): boolean => isLiteralTypeWithValue(node, value);

const isNumericLiteralType = (
    node: Readonly<TSESTree.TypeNode>,
    value: number
): boolean => isLiteralTypeWithValue(node, value);

/**
 * Return the only tuple element type when the node is a single-element tuple.
 */
export const getSingleTupleElementType = (
    node: Readonly<TSESTree.TypeNode>
): TSESTree.TypeNode | undefined =>
    node.type === AST_NODE_TYPES.TSTupleType && node.elementTypes.length === 1
        ? arrayFirst(node.elementTypes)
        : undefined;

const isTargetKeywordType = (
    node: Readonly<TSESTree.TypeNode>,
    target: TupleWrappedGuardTarget
): boolean => {
    switch (target) {
        case "never": {
            return node.type === AST_NODE_TYPES.TSNeverKeyword;
        }
        case "null": {
            return node.type === AST_NODE_TYPES.TSNullKeyword;
        }
        case "undefined": {
            return node.type === AST_NODE_TYPES.TSUndefinedKeyword;
        }
        default: {
            return assertNever(target);
        }
    }
};

/**
 * Determine whether a conditional type has exact `true` then `false` branches.
 */
export const hasTrueFalseBranches = (
    node: Readonly<TSESTree.TSConditionalType>
): boolean =>
    isBooleanLiteralType(node.trueType, true) &&
    isBooleanLiteralType(node.falseType, false);

/**
 * Determine whether a conditional type has exact `false` then `true` branches.
 */
export const hasFalseTrueBranches = (
    node: Readonly<TSESTree.TSConditionalType>
): boolean =>
    isBooleanLiteralType(node.trueType, false) &&
    isBooleanLiteralType(node.falseType, true);

const getNoInferTypeArgument = (
    node: Readonly<TSESTree.TypeNode>
): TSESTree.TypeNode | undefined => {
    if (
        node.type !== AST_NODE_TYPES.TSTypeReference ||
        node.typeName.type !== AST_NODE_TYPES.Identifier ||
        node.typeName.name !== "NoInfer"
    ) {
        return undefined;
    }

    const typeArguments = node.typeArguments?.params;

    return typeArguments?.length === 1 ? arrayFirst(typeArguments) : undefined;
};

/**
 * Extract `T` from `[T] extends [Target] ? true : false`.
 */
export const getTupleWrappedTypeGuardInput = (
    node: Readonly<TSESTree.TSConditionalType>,
    target: TupleWrappedGuardTarget
): TSESTree.TypeNode | undefined => {
    if (!hasTrueFalseBranches(node)) {
        return undefined;
    }

    const checkedType = getSingleTupleElementType(node.checkType);
    const extendsType = getSingleTupleElementType(node.extendsType);

    if (
        !checkedType ||
        !extendsType ||
        !isTargetKeywordType(extendsType, target)
    ) {
        return undefined;
    }

    return checkedType;
};

/**
 * Extract `T` from `0 extends 1 & T ? true : false`.
 */
export const getIsAnyTypeGuardInput = (
    node: Readonly<TSESTree.TSConditionalType>
): TSESTree.TypeNode | undefined => {
    if (
        !hasTrueFalseBranches(node) ||
        !isNumericLiteralType(node.checkType, 0) ||
        node.extendsType.type !== AST_NODE_TYPES.TSIntersectionType ||
        node.extendsType.types.length !== 2
    ) {
        return undefined;
    }

    const [leftType, rightType] = node.extendsType.types;

    if (!leftType || !rightType || !isNumericLiteralType(leftType, 1)) {
        return undefined;
    }

    return getNoInferTypeArgument(rightType) ?? rightType;
};

/**
 * Extract `T` from `number extends T["length"] ? false : true`.
 */
export const getIsTupleTypeGuardInput = (
    node: Readonly<TSESTree.TSConditionalType>
): TSESTree.TypeNode | undefined => {
    if (
        !hasFalseTrueBranches(node) ||
        node.checkType.type !== AST_NODE_TYPES.TSNumberKeyword ||
        node.extendsType.type !== AST_NODE_TYPES.TSIndexedAccessType
    ) {
        return undefined;
    }

    const indexType = node.extendsType.indexType;

    return indexType.type === AST_NODE_TYPES.TSLiteralType &&
        indexType.literal.type === AST_NODE_TYPES.Literal &&
        indexType.literal.value === "length"
        ? node.extendsType.objectType
        : undefined;
};
