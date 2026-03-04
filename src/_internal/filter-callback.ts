/**
 * @packageDocumentation
 * Utilities for detecting nodes that live inside `.filter(...)` callbacks.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { getParentNode } from "./ast-node.js";

/** Target method name used for callback-context detection. */
const FILTER_METHOD_NAME = "filter";

/**
 * Narrows nodes to function-like callback expressions.
 */
const isFunctionCallbackNode = (
    node: Readonly<TSESTree.Node>
): node is TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression =>
    node.type === "ArrowFunctionExpression" ||
    node.type === "FunctionExpression";

/**
 * Narrows call expressions to direct `.filter(...)` calls.
 */
export const isFilterCallExpression = (
    expression: Readonly<TSESTree.CallExpression>
): expression is TSESTree.CallExpression & {
    callee: TSESTree.MemberExpression & {
        computed: false;
        property: TSESTree.Identifier;
    };
} =>
    expression.callee.type === "MemberExpression" &&
    !expression.callee.computed &&
    expression.callee.property.type === "Identifier" &&
    expression.callee.property.name === FILTER_METHOD_NAME;

/**
 * Checks whether a node appears inside a callback passed as the first argument
 * to a direct `.filter(...)` call.
 *
 * @param node - Node to inspect.
 *
 * @returns `true` when the node is inside a `.filter(...)` callback; otherwise
 *   `false`.
 */
export const isWithinFilterCallback = (
    node: Readonly<TSESTree.Node>
): boolean => {
    let currentNode: TSESTree.Node | undefined = node;
    const visitedNodes = new Set<TSESTree.Node>();

    while (currentNode) {
        if (visitedNodes.has(currentNode)) {
            return false;
        }

        visitedNodes.add(currentNode);

        if (isFunctionCallbackNode(currentNode)) {
            const callbackParent = getParentNode(currentNode);
            const [firstArgument] =
                callbackParent?.type === "CallExpression"
                    ? callbackParent.arguments
                    : [];

            if (
                callbackParent?.type === "CallExpression" &&
                firstArgument === currentNode &&
                isFilterCallExpression(callbackParent)
            ) {
                return true;
            }
        }

        currentNode = getParentNode(currentNode);
    }

    return false;
};
