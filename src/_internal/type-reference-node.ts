import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * Predicate helpers for narrowing `TSTypeReference` nodes by identifier name.
 */

const TS_PARENTHESIZED_TYPE = "TSParenthesizedType";

const isTypeNodeLike = (value: unknown): value is Readonly<TSESTree.TypeNode> =>
    typeof value === "object" &&
    value !== null &&
    typeof Reflect.get(value, "type") === "string";

/**
 * Checks whether a type node is an identifier-based type reference with a
 * specific symbol name.
 *
 * @param node - Type node candidate.
 * @param identifierName - Expected referenced identifier name.
 *
 * @returns `true` when the node is `TSTypeReference` and the referenced
 *   `typeName` identifier matches exactly.
 */
export const isIdentifierTypeReference = (
    node: Readonly<TSESTree.TypeNode>,
    identifierName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === AST_NODE_TYPES.TSTypeReference &&
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    node.typeName.name === identifierName;

/**
 * Unwrap transparent parenthesized type nodes.
 *
 * @param node - Type node to normalize.
 *
 * @returns The innermost non-parenthesized type node.
 */
export const unwrapParenthesizedTypeNode = (
    node: Readonly<TSESTree.TypeNode>
): Readonly<TSESTree.TypeNode> => {
    const nodeObject: object = node;
    const nodeType: unknown = Reflect.get(nodeObject, "type");

    if (nodeType !== TS_PARENTHESIZED_TYPE) {
        return node;
    }

    const typeAnnotation: unknown = Reflect.get(nodeObject, "typeAnnotation");

    return isTypeNodeLike(typeAnnotation)
        ? unwrapParenthesizedTypeNode(typeAnnotation)
        : node;
};
