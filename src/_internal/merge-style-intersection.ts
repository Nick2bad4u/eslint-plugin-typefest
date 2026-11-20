/**
 * @packageDocumentation
 * Shared detection for hand-written `Merge<Destination, Source>` intersections.
 */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { arrayAt, arrayFirst } from "ts-extras";

import { getParentNode } from "./ast-node.js";
import { areEquivalentTypeNodes } from "./normalize-expression-text.js";
import { unwrapParenthesizedTypeNode } from "./type-reference-node.js";

/** Read the source from a two-argument reference ending with `keyof Source`. */
const getOmittedKeySource = (
    typeArguments: readonly TSESTree.TypeNode[]
): TSESTree.TypeNode | undefined => {
    const argument = arrayAt(typeArguments, 1);
    if (!argument || typeArguments.length !== 2) {
        return undefined;
    }

    const keys = unwrapParenthesizedTypeNode(argument);
    return keys.type === AST_NODE_TYPES.TSTypeOperator &&
        keys.operator === "keyof"
        ? keys.typeAnnotation
        : undefined;
};

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
        !typeArguments ||
        intersectionNode?.type !== AST_NODE_TYPES.TSIntersectionType
    ) {
        return undefined;
    }

    const destination = arrayFirst(typeArguments);
    const keyedSourceType = getOmittedKeySource(typeArguments);

    if (!destination || !keyedSourceType) {
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
