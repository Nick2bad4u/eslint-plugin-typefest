/**
 * @packageDocumentation
 * Shared detection for hand-written `Merge<Destination, Source>` intersections.
 */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { arrayAt, arrayFirst } from "ts-extras";

import { getParentNode } from "./ast-node.js";
import { areEquivalentTypeNodes } from "./normalize-expression-text.js";
import { unwrapParenthesizedTypeNode } from "./type-reference-node.js";

/**
 * Match a key-removing type reference in an intersection containing its source.
 *
 * @param node - Candidate key-removing type reference.
 *
 * @returns The destination and source operands of a matching intersection.
 */
export const getMergeStyleIntersectionOperands = (
    node: Readonly<TSESTree.TSTypeReference>
): readonly [TSESTree.TypeNode, TSESTree.TypeNode] | undefined => {
    const intersectionNode = getParentNode(node);
    const typeArguments = node.typeArguments?.params;

    if (
        intersectionNode?.type !== AST_NODE_TYPES.TSIntersectionType ||
        typeArguments?.length !== 2
    ) {
        return undefined;
    }

    const destination = arrayFirst(typeArguments);
    const omittedKeysType = arrayAt(typeArguments, 1);

    if (!destination || !omittedKeysType) {
        return undefined;
    }

    const normalizedOmittedKeysType =
        unwrapParenthesizedTypeNode(omittedKeysType);

    if (
        normalizedOmittedKeysType.type !== AST_NODE_TYPES.TSTypeOperator ||
        normalizedOmittedKeysType.operator !== "keyof"
    ) {
        return undefined;
    }

    const keyedSourceType = normalizedOmittedKeysType.typeAnnotation;

    if (!keyedSourceType) {
        return undefined;
    }

    const hasSource = intersectionNode.types.some(
        (memberType) =>
            memberType !== node &&
            areEquivalentTypeNodes(
                unwrapParenthesizedTypeNode(memberType),
                keyedSourceType
            )
    );

    return hasSource ? [destination, keyedSourceType] : undefined;
};
