/**
 * @packageDocumentation
 * Shared detection for hand-written `Merge<Destination, Source>` intersections.
 */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

import { getParentNode } from "./ast-node.js";
import { areEquivalentTypeNodes } from "./normalize-expression-text.js";
import { unwrapParenthesizedTypeNode } from "./type-reference-node.js";

/**
 * Check whether a key-removing type reference such as `Omit<Destination, keyof
 * Source>` is a member of an intersection that also contains `Source`.
 *
 * @param node - Candidate key-removing type reference.
 *
 * @returns `true` when the reference encodes the `Merge<Destination, Source>`
 *   pattern; otherwise `false`.
 */
export const isMergeStyleIntersectionMember = (
    node: Readonly<TSESTree.TSTypeReference>
): boolean => {
    const intersectionNode = getParentNode(node);
    const typeArguments = node.typeArguments?.params;

    if (
        intersectionNode?.type !== AST_NODE_TYPES.TSIntersectionType ||
        typeArguments?.length !== 2
    ) {
        return false;
    }

    const [, omittedKeysType] = typeArguments;

    if (omittedKeysType === undefined) {
        return false;
    }

    const normalizedOmittedKeysType =
        unwrapParenthesizedTypeNode(omittedKeysType);

    if (
        normalizedOmittedKeysType.type !== AST_NODE_TYPES.TSTypeOperator ||
        normalizedOmittedKeysType.operator !== "keyof"
    ) {
        return false;
    }

    const keyedSourceType = normalizedOmittedKeysType.typeAnnotation;

    if (keyedSourceType === undefined) {
        return false;
    }

    return intersectionNode.types.some(
        (memberType) =>
            memberType !== node &&
            areEquivalentTypeNodes(
                unwrapParenthesizedTypeNode(memberType),
                keyedSourceType
            )
    );
};
