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
 * UnwrapParenthesizedExpression helper.
 *
 * @param expression - Value to inspect.
 *
 * @returns UnwrapParenthesizedExpression helper result.
 */
const unwrapTransparentExpression = (
    expression: Readonly<TSESTree.Expression>
): Readonly<TSESTree.Expression> => {
    let currentExpression = expression;

    while (true) {
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

const areEquivalentNodeValues = (left: unknown, right: unknown): boolean => {
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

        if (left.length !== right.length) {
            return false;
        }

        return left.every((value, index) =>
            areEquivalentNodeValues(value, right[index])
        );
    }

    if (!isComparableRecord(left) || !isComparableRecord(right)) {
        return false;
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

        return areEquivalentNodeValues(left[key], right[key]);
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
