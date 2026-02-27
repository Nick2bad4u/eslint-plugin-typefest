import type { TSESTree } from "@typescript-eslint/utils";
import type { JsonObject } from "type-fest";

type ComparableObject = Readonly<JsonObject>;

const ignoredPropertyKeys = new Set<string>([
    "end",
    "loc",
    "parent",
    "range",
    "start",
]);

const isComparableRecord = (value: unknown): value is ComparableObject =>
    typeof value === "object" && value !== null;

const getComparableKeys = (value: ComparableObject): readonly string[] =>
    Object.keys(value).filter((key) => !ignoredPropertyKeys.has(key));

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

const markAndCheckSeenPair = (
    left: object,
    right: object,
    seenPairs: WeakMap<object, WeakSet<object>>
): boolean => {
    const seenRightNodes = seenPairs.get(left);
    if (seenRightNodes?.has(right) === true) {
        return true;
    }

    if (seenRightNodes === undefined) {
        seenPairs.set(left, new WeakSet([right]));
    } else {
        seenRightNodes.add(right);
    }

    return false;
};

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
 * AreEquivalentExpressions helper.
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
 * AreEquivalentTypeNodes helper.
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
