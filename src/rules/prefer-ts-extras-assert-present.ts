/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-assert-present`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * Check whether the input is null expression.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is null expression; otherwise `false`.
 */

const isNullExpression = (node: TSESTree.Expression): boolean =>
    node.type === "Literal" && node.value === null;

/**
 * Check whether the input is undefined expression.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is undefined expression; otherwise `false`.
 */

const isUndefinedExpression = (node: TSESTree.Expression): boolean =>
    node.type === "Identifier" && node.name === "undefined";

/**
 * Check whether the input is throw only consequent.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is throw only consequent; otherwise `false`.
 */

const isThrowOnlyConsequent = (node: TSESTree.Statement): boolean => {
    if (node.type === "ThrowStatement") {
        return true;
    }

    return (
        node.type === "BlockStatement" &&
        node.body.length === 1 &&
        node.body[0]?.type === "ThrowStatement"
    );
};

/**
 * ExtractEqNullGuardExpression helper.
 *
 * @param test - Value to inspect.
 *
 * @returns ExtractEqNullGuardExpression helper result.
 */

const extractEqNullGuardExpression = (
    test: TSESTree.Expression
): null | TSESTree.Expression => {
    if (test.type !== "BinaryExpression" || test.operator !== "==") {
        return null;
    }

    if (isNullExpression(test.left)) {
        return test.right;
    }

    if (isNullExpression(test.right)) {
        return test.left;
    }

    return null;
};

/**
 * ExtractNullishEqualityPart helper.
 *
 * @param expression - Value to inspect.
 *
 * @returns ExtractNullishEqualityPart helper result.
 */

const extractNullishEqualityPart = (
    expression: TSESTree.Expression
): null | {
    expression: TSESTree.Expression;
    kind: "null" | "undefined";
} => {
    if (
        expression.type !== "BinaryExpression" ||
        (expression.operator !== "==" && expression.operator !== "===")
    ) {
        return null;
    }

    if (isNullExpression(expression.left)) {
        return {
            expression: expression.right,
            kind: "null",
        };
    }

    if (isNullExpression(expression.right)) {
        return {
            expression: expression.left,
            kind: "null",
        };
    }

    if (isUndefinedExpression(expression.left)) {
        return {
            expression: expression.right,
            kind: "undefined",
        };
    }

    if (isUndefinedExpression(expression.right)) {
        return {
            expression: expression.left,
            kind: "undefined",
        };
    }

    return null;
};

/**
 * ESLint rule definition for `prefer-ts-extras-assert-present`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasAssertPresentRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            const { sourceCode } = context;

            const extractPresentGuardExpression = (
                test: TSESTree.Expression
            ): null | TSESTree.Expression => {
                const eqNullExpression = extractEqNullGuardExpression(test);
                if (eqNullExpression) {
                    return eqNullExpression;
                }

                if (
                    test.type !== "LogicalExpression" ||
                    test.operator !== "||"
                ) {
                    return null;
                }

                const leftPart = extractNullishEqualityPart(test.left);
                const rightPart = extractNullishEqualityPart(test.right);

                if (
                    !leftPart ||
                    !rightPart ||
                    leftPart.kind === rightPart.kind
                ) {
                    return null;
                }

                return sourceCode.getText(leftPart.expression) ===
                    sourceCode.getText(rightPart.expression)
                    ? leftPart.expression
                    : null;
            };

            return {
                IfStatement(node) {
                    if (
                        node.alternate ||
                        !isThrowOnlyConsequent(node.consequent)
                    ) {
                        return;
                    }

                    if (!extractPresentGuardExpression(node.test)) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasAssertPresent",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras assertPresent over manual nullish-guard throw blocks.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-assert-present.md",
            },
            messages: {
                preferTsExtrasAssertPresent:
                    "Prefer `assertPresent` from `ts-extras` over manual nullish guard throw blocks.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-assert-present",
    });

/**
 * Default export for the `prefer-ts-extras-assert-present` rule module.
 */
export default preferTsExtrasAssertPresentRule;
