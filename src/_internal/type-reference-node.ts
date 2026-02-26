import type { TSESTree } from "@typescript-eslint/utils";

/**
 * Check whether a type reference points to a specific identifier name.
 *
 * @param node - Type reference node.
 * @param identifierName - Expected identifier name.
 *
 * @returns `true` when the type reference matches; otherwise `false`.
 */
export const isIdentifierTypeReference = (
    node: Readonly<TSESTree.TypeNode>,
    identifierName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === identifierName;
