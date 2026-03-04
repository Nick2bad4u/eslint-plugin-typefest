/**
 * @packageDocumentation
 * AST parent-chain traversal helpers used by multiple rule utilities.
 */
import type { TSESTree } from "@typescript-eslint/utils";

/**
 * AST node shape that may carry a parser-populated `parent` reference.
 */
type NodeWithOptionalParent = Readonly<TSESTree.Node> & {
    parent?: Readonly<TSESTree.Node>;
};

/**
 * Determine whether a node exposes an optional `parent` property.
 */
const hasOptionalParentProperty = (
    node: Readonly<TSESTree.Node>
): node is NodeWithOptionalParent => "parent" in node;

/**
 * Gets a node's parent reference when available.
 *
 * @param node - AST node whose parent should be read.
 *
 * @returns Parent node when present on parser output; otherwise `undefined`.
 */
export const getParentNode = (
    node: Readonly<TSESTree.Node>
): Readonly<TSESTree.Node> | undefined =>
    hasOptionalParentProperty(node) ? node.parent : undefined;

/**
 * Walks the parent chain to locate the enclosing `Program` node.
 *
 * @param node - Starting AST node.
 *
 * @returns Nearest enclosing `Program` node; otherwise `null` when no program
 *   boundary can be reached (including cycle-guard termination).
 */
export const getProgramNode = (
    node: Readonly<TSESTree.Node>
): null | Readonly<TSESTree.Program> => {
    let currentNode: null | Readonly<TSESTree.Node> = node;
    const visitedNodes = new Set<Readonly<TSESTree.Node>>();

    while (currentNode !== null) {
        if (visitedNodes.has(currentNode)) {
            return null;
        }

        visitedNodes.add(currentNode);

        if (currentNode.type === "Program") {
            return currentNode;
        }

        currentNode = getParentNode(currentNode) ?? null;
    }

    return null;
};
