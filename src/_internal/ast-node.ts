import type { TSESTree } from "@typescript-eslint/utils";

/**
 * Get node parent when available.
 *
 * @param node - AST node.
 *
 * @returns Parent node when available.
 */
export const getParentNode = (
    node: Readonly<TSESTree.Node>
): Readonly<TSESTree.Node> | undefined => {
    const nodeWithParent = node as Readonly<TSESTree.Node> & {
        parent?: Readonly<TSESTree.Node>;
    };

    return nodeWithParent.parent;
};

/**
 * Walk parent chain to find enclosing Program node.
 *
 * @param node - AST node.
 *
 * @returns Enclosing Program node when found; otherwise `null`.
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
