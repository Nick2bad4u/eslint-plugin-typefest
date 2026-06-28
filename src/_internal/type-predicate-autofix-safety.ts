import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * Conservative safety checks for autofixes that introduce type predicates.
 */
import { getParentNode } from "./ast-node.js";
import { isTransparentExpressionWrapper } from "./value-rewrite-autofix-safety.js";

/**
 * Determine whether a call-expression replacement to a type-predicate helper is
 * safe to apply as an autofix.
 *
 * @remarks
 * Type-predicate helpers (for example `setHas`) can change control-flow
 * narrowing in boolean guard expressions. This check intentionally disables
 * autofix in those contexts and leaves a diagnostic for manual review.
 */
export const isTypePredicateExpressionAutofixSafe = (
    node: Readonly<TSESTree.Expression>
): boolean => {
    let currentNode: Readonly<TSESTree.Node> = node;

    while (true) {
        const parentNode = getParentNode(currentNode);

        if (parentNode === undefined) {
            return true;
        }

        if (isTransparentExpressionWrapper(parentNode, currentNode)) {
            currentNode = parentNode;
            continue;
        }

        if (
            parentNode.type === AST_NODE_TYPES.UnaryExpression &&
            parentNode.operator === "!" &&
            parentNode.argument === currentNode
        ) {
            return false;
        }

        if (
            parentNode.type === AST_NODE_TYPES.LogicalExpression &&
            (parentNode.left === currentNode ||
                parentNode.right === currentNode)
        ) {
            return false;
        }

        if (
            parentNode.type === AST_NODE_TYPES.ConditionalExpression &&
            parentNode.test === currentNode
        ) {
            return false;
        }

        if (
            (parentNode.type === AST_NODE_TYPES.DoWhileStatement ||
                parentNode.type === AST_NODE_TYPES.IfStatement ||
                parentNode.type === AST_NODE_TYPES.WhileStatement) &&
            parentNode.test === currentNode
        ) {
            return false;
        }

        if (
            parentNode.type === AST_NODE_TYPES.ForStatement &&
            parentNode.test === currentNode
        ) {
            return false;
        }

        return (
            parentNode.type !== AST_NODE_TYPES.SwitchCase ||
            parentNode.test !== currentNode
        );
    }
};

/**
 * Backward-compatible alias for call-expression-based callers.
 */
export const isTypePredicateAutofixSafe = (
    node: Readonly<TSESTree.CallExpression>
): boolean => isTypePredicateExpressionAutofixSafe(node);
