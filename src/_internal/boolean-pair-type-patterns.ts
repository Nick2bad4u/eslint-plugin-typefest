import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * Shared AST pattern helpers for boolean-pair TypeFest rules.
 */

/**
 * Text for a two-element boolean tuple argument.
 */
export type BooleanPairTupleArgumentText = Readonly<{
    leftTypeText: string;
    rightTypeText: string;
}>;

const getReadonlyTupleType = (
    node: Readonly<TSESTree.TypeNode>
): TSESTree.TSTupleType | undefined => {
    if (node.type === AST_NODE_TYPES.TSTupleType) {
        return node;
    }

    if (
        node.type === AST_NODE_TYPES.TSTypeOperator &&
        node.operator === "readonly" &&
        node.typeAnnotation?.type === AST_NODE_TYPES.TSTupleType
    ) {
        return node.typeAnnotation;
    }

    return undefined;
};

const isPlainTupleElementType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    node.type !== AST_NODE_TYPES.TSNamedTupleMember &&
    node.type !== AST_NODE_TYPES.TSOptionalType &&
    node.type !== AST_NODE_TYPES.TSRestType;

/**
 * Extract element text from a type reference whose only argument is a two-item
 * tuple.
 */
export const getTwoElementTupleArgumentText = (
    typeReference: Readonly<TSESTree.TSTypeReference>,
    sourceCode: Readonly<TSESLint.SourceCode>
): BooleanPairTupleArgumentText | undefined => {
    const typeArguments = typeReference.typeArguments?.params ?? [];
    const [tupleArgument] = typeArguments;

    if (!tupleArgument || typeArguments.length !== 1) {
        return undefined;
    }

    const tupleType = getReadonlyTupleType(tupleArgument);

    if (tupleType?.elementTypes.length !== 2) {
        return undefined;
    }

    const [leftType, rightType] = tupleType.elementTypes;

    if (
        !leftType ||
        !rightType ||
        !isPlainTupleElementType(leftType) ||
        !isPlainTupleElementType(rightType)
    ) {
        return undefined;
    }

    return {
        leftTypeText: sourceCode.getText(leftType),
        rightTypeText: sourceCode.getText(rightType),
    };
};
