import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * Shared safety checks for value-expression autofixes.
 */
import { getParentNode } from "./ast-node.js";

/**
 * Check whether a parent node is a transparent expression wrapper for `child`.
 */
export const isTransparentExpressionWrapper = (
    parent: Readonly<TSESTree.Node>,
    child: Readonly<TSESTree.Node>
): boolean => {
    if (parent.type === AST_NODE_TYPES.ChainExpression) {
        return parent.expression === child;
    }

    if (parent.type === AST_NODE_TYPES.TSAsExpression) {
        return parent.expression === child;
    }

    if (parent.type === AST_NODE_TYPES.TSNonNullExpression) {
        return parent.expression === child;
    }

    if (parent.type === AST_NODE_TYPES.TSSatisfiesExpression) {
        return parent.expression === child;
    }

    if (parent.type === AST_NODE_TYPES.TSTypeAssertion) {
        return parent.expression === child;
    }

    return false;
};

/**
 * Detect whether an expression is a chain/optional-call/optional-member shape.
 */
export const isOptionalChainExpression = (
    node: Readonly<TSESTree.Expression>
): boolean =>
    node.type === AST_NODE_TYPES.ChainExpression ||
    ((node.type === AST_NODE_TYPES.CallExpression ||
        node.type === AST_NODE_TYPES.MemberExpression) &&
        node.optional);

/**
 * Determine whether an expression occupies a direct return position.
 */
export const isDirectReturnLikeExpressionPosition = (
    node: Readonly<TSESTree.Expression>
): boolean => {
    let currentNode: Readonly<TSESTree.Node> = node;

    while (true) {
        const parentNode = getParentNode(currentNode);

        if (parentNode === undefined) {
            return false;
        }

        if (isTransparentExpressionWrapper(parentNode, currentNode)) {
            currentNode = parentNode;
            continue;
        }

        if (
            parentNode.type === AST_NODE_TYPES.ReturnStatement &&
            parentNode.argument === currentNode
        ) {
            return true;
        }

        return (
            parentNode.type === AST_NODE_TYPES.ArrowFunctionExpression &&
            parentNode.body === currentNode
        );
    }
};

/**
 * Guard array index-to-helper rewrites known to be type-sensitive.
 */
export const isArrayIndexReadAutofixSafe = (
    node: Readonly<TSESTree.MemberExpression>
): boolean => {
    if (isOptionalChainExpression(node.object)) {
        return false;
    }

    return !isDirectReturnLikeExpressionPosition(node);
};

/**
 * Determine whether an expression is safe to evaluate fewer times after a
 * rewrite that collapses duplicate evaluations.
 *
 * @remarks
 * Expressions such as member access or function calls can change runtime
 * behavior when duplicated evaluation sites are rewritten to a single helper
 * call. This helper intentionally accepts only stable, exception-free
 * primitives and identifiers.
 */
export const isRepeatablyEvaluableExpression = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>
): node is TSESTree.Expression => {
    if (node.type === AST_NODE_TYPES.PrivateIdentifier) {
        return false;
    }

    if (
        node.type === AST_NODE_TYPES.TSAsExpression ||
        node.type === AST_NODE_TYPES.TSNonNullExpression ||
        node.type === AST_NODE_TYPES.TSSatisfiesExpression ||
        node.type === AST_NODE_TYPES.TSTypeAssertion
    ) {
        return isRepeatablyEvaluableExpression(node.expression);
    }

    if (node.type === AST_NODE_TYPES.ChainExpression) {
        return isRepeatablyEvaluableExpression(node.expression);
    }

    if (node.type === AST_NODE_TYPES.Identifier) {
        return true;
    }

    if (node.type === AST_NODE_TYPES.Literal) {
        return true;
    }

    if (node.type === AST_NODE_TYPES.TemplateLiteral) {
        return node.expressions.length === 0;
    }

    return node.type === AST_NODE_TYPES.ThisExpression;
};
