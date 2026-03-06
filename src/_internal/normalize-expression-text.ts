/**
 * @packageDocumentation
 * Structural normalization and equivalence checks for expressions and type
 * nodes used by safe-fix heuristics.
 */
import type { TSESTree } from "@typescript-eslint/utils";
import type { JsonObject } from "type-fest";

import { isDefined, objectKeys  } from "ts-extras";

/**
 * Object-like value that can participate in deep structural comparisons.
 */
type ComparableObject = Readonly<JsonObject>;

/**
 * ESTree metadata keys ignored during structural-equivalence checks.
 */
const ignoredPropertyKeys = new Set<string>([
    "end",
    "loc",
    "parent",
    "range",
    "start",
]);

/**
 * Check whether a value is object-like for structural comparisons.
 */
const isComparableRecord = (value: unknown): value is ComparableObject =>
    typeof value === "object" && value !== null;

/**
 * Return stable comparable keys after stripping metadata properties.
 */
const getComparableKeys = (value: ComparableObject): readonly string[] =>
    objectKeys(value).filter((key) => !ignoredPropertyKeys.has(key));

/**
 * Unwrap transparent TypeScript expression wrappers.
 *
 * @param expression - Expression to normalize.
 *
 * @returns The innermost wrapped expression.
 */
const unwrapTransparentExpression = (
    expression: Readonly<TSESTree.Expression>
): Readonly<TSESTree.Expression> => {
    let currentExpression = expression;
    const visitedExpressions = new Set<Readonly<TSESTree.Expression>>();

    while (true) {
        if (visitedExpressions.has(currentExpression)) {
            return currentExpression;
        }

        visitedExpressions.add(currentExpression);

        if (currentExpression.type === "TSAsExpression") {
            currentExpression = currentExpression.expression;
            continue;
        }

        if (currentExpression.type === "TSNonNullExpression") {
            currentExpression = currentExpression.expression;
            continue;
        }

        if (currentExpression.type === "TSSatisfiesExpression") {
            currentExpression = currentExpression.expression;
            continue;
        }

        if (currentExpression.type === "TSTypeAssertion") {
            currentExpression = currentExpression.expression;
            continue;
        }

        return currentExpression;
    }
};

/**
 * Records a compared object pair and reports whether that pair was already
 * visited.
 *
 * @param left - Left-side object in the comparison pair.
 * @param right - Right-side object in the comparison pair.
 * @param seenPairs - Weakly-held pair-tracking cache for cycle-safe traversal.
 *
 * @returns `true` when this exact pair has already been processed.
 */
const markAndCheckSeenPair = (
    left: object,
    right: object,
    seenPairs: WeakMap<object, WeakSet<object>>
): boolean => {
    const seenRightNodes = seenPairs.get(left);
    if (seenRightNodes?.has(right) === true) {
        return true;
    }

    if (isDefined(seenRightNodes)) {
        seenRightNodes.add(right);
    } else {
        seenPairs.set(left, new WeakSet([right]));
    }

    return false;
};

/**
 * Deep structural comparison that is resilient to cycles and ESTree metadata
 * fields.
 *
 * @param left - Left-side value.
 * @param right - Right-side value.
 * @param seenPairs - Pair cache used to break recursive cycles.
 *
 * @returns `true` when the values are structurally equivalent after metadata
 *   normalization.
 */
const areEquivalentNodeValues = (
    left: unknown,
    right: unknown,
    seenPairs: WeakMap<object, WeakSet<object>> = new WeakMap()
): boolean => {
    if (Object.is(left, right)) {
        return true;
    }

    if (typeof left !== typeof right) {
        return false;
    }

    if (left === null || right === null) {
        return false;
    }

    if (Array.isArray(left) || Array.isArray(right)) {
        if (!Array.isArray(left) || !Array.isArray(right)) {
            return false;
        }

        if (markAndCheckSeenPair(left, right, seenPairs)) {
            return true;
        }

        if (left.length !== right.length) {
            return false;
        }

        return left.every((value, index) =>
            areEquivalentNodeValues(value, right[index], seenPairs)
        );
    }

    if (!isComparableRecord(left) || !isComparableRecord(right)) {
        return false;
    }

    if (markAndCheckSeenPair(left, right, seenPairs)) {
        return true;
    }

    const leftKeys = getComparableKeys(left);
    const rightKeys = getComparableKeys(right);
    const rightKeySet = new Set(rightKeys);

    if (leftKeys.length !== rightKeys.length) {
        return false;
    }

    if (leftKeys.some((key) => !rightKeySet.has(key))) {
        return false;
    }

    return leftKeys.every((key) => {
        if (!Object.hasOwn(left, key) || !Object.hasOwn(right, key)) {
            return false;
        }

        return areEquivalentNodeValues(left[key], right[key], seenPairs);
    });
};

/**
 * Compare two expressions for structural equivalence after unwrapping
 * transparent TypeScript wrappers.
 *
 * @param left - Left-hand expression.
 * @param right - Right-hand expression.
 *
 * @returns `true` when both expressions are structurally equivalent.
 */
export const areEquivalentExpressions = (
    left: Readonly<TSESTree.Expression>,
    right: Readonly<TSESTree.Expression>
): boolean =>
    areEquivalentNodeValues(
        unwrapTransparentExpression(left),
        unwrapTransparentExpression(right)
    );

/**
 * Compare two type nodes for structural equivalence.
 *
 * @param left - Left-hand type node.
 * @param right - Right-hand type node.
 *
 * @returns `true` when both type nodes are structurally equivalent.
 */
export const areEquivalentTypeNodes = (
    left: Readonly<TSESTree.TypeNode>,
    right: Readonly<TSESTree.TypeNode>
): boolean => areEquivalentNodeValues(left, right);
