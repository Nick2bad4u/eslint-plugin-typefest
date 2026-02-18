/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-infinite`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * Check whether the input is infinity reference.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is infinity reference; otherwise `false`.
 */

const isInfinityReference = (node: TSESTree.Expression): boolean => {
    if (node.type === "Identifier" && node.name === "Infinity") {
        return true;
    }

    return (
        node.type === "MemberExpression" &&
        !node.computed &&
        node.object.type === "Identifier" &&
        node.object.name === "Number" &&
        node.property.type === "Identifier" &&
        (node.property.name === "POSITIVE_INFINITY" ||
            node.property.name === "NEGATIVE_INFINITY")
    );
};

/**
 * ESLint rule definition for `prefer-ts-extras-is-infinite`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsInfiniteRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                BinaryExpression(node) {
                    if (node.operator !== "==" && node.operator !== "===") {
                        return;
                    }

                    if (
                        !isInfinityReference(node.left) &&
                        !isInfinityReference(node.right)
                    ) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasIsInfinite",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras isInfinite over direct Infinity equality checks for consistent predicate helper usage.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-infinite.md",
            },
            messages: {
                preferTsExtrasIsInfinite:
                    "Prefer `isInfinite` from `ts-extras` over direct Infinity equality checks.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-infinite",
    });

/**
 * Default export for the `prefer-ts-extras-is-infinite` rule module.
 */
export default preferTsExtrasIsInfiniteRule;

