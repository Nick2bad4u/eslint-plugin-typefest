/**
 * @packageDocumentation
 * Predicate helpers for narrowing `TSTypeReference` nodes by identifier name.
 */
import type { TSESTree } from "@typescript-eslint/utils";

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
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === identifierName;
