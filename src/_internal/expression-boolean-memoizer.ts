/**
 * @packageDocumentation
 * Shared helper for memoizing boolean expression predicates by ESTree node
 * identity.
 */
import type { TSESTree } from "@typescript-eslint/utils";

/**
 * Memoize a boolean expression predicate using a `WeakMap` keyed by expression
 * node identity.
 *
 * @param evaluate - Predicate to memoize.
 *
 * @returns Memoized predicate that reuses previous results for the same node
 *   object.
 */
export const memoizeExpressionBooleanPredicate = (
    evaluate: (expression: Readonly<TSESTree.Expression>) => boolean
): ((expression: Readonly<TSESTree.Expression>) => boolean) => {
    const cache = new WeakMap<Readonly<TSESTree.Expression>, boolean>();

    return (expression) => {
        if (cache.has(expression)) {
            return cache.get(expression) ?? false;
        }

        const result = evaluate(expression);

        cache.set(expression, result);

        return result;
    };
};
