/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-assert-error`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * Check whether is throw only consequent.
 *
 * @param node - Input value for node.
 *
 * @returns `true` when is throw only consequent; otherwise `false`.
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
 * Check whether is error instanceof expression.
 *
 * @param node - Input value for node.
 *
 * @returns `true` when is error instanceof expression; otherwise `false`.
 */

const isErrorInstanceofExpression = (
    node: TSESTree.Expression
): node is TSESTree.BinaryExpression =>
    node.type === "BinaryExpression" &&
    node.operator === "instanceof" &&
    node.right.type === "Identifier" &&
    node.right.name === "Error";

/**
 * ExtractAssertErrorTarget helper.
 *
 * @param test - Input value for test.
 *
 * @returns Computed result for `extractAssertErrorTarget`.
 */

const extractAssertErrorTarget = (
    test: TSESTree.Expression
): null | TSESTree.Expression => {
    if (
        test.type !== "UnaryExpression" ||
        test.operator !== "!" ||
        !isErrorInstanceofExpression(test.argument)
    ) {
        return null;
    }

    return test.argument.left.type === "PrivateIdentifier"
        ? null
        : test.argument.left;
};

/**
 * ESLint rule definition for `prefer-ts-extras-assert-error`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasAssertErrorRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                IfStatement(node) {
                    if (
                        node.alternate ||
                        !isThrowOnlyConsequent(node.consequent)
                    ) {
                        return;
                    }

                    if (!extractAssertErrorTarget(node.test)) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasAssertError",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras assertError over manual instanceof Error throw guards.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-assert-error.md",
            },
            messages: {
                preferTsExtrasAssertError:
                    "Prefer `assertError` from `ts-extras` over manual `instanceof Error` throw guards.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-assert-error",
    });

/**
 * Default export for the `prefer-ts-extras-assert-error` rule module.
 */
export default preferTsExtrasAssertErrorRule;

