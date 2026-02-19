/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-defined`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const FILTER_METHOD_NAME = "filter";

type NodeWithParent = TSESTree.Node & {
    parent?: TSESTree.Node;
};

type UndefinedComparisonMatch = {
    readonly comparedExpression: TSESTree.Expression;
    readonly prefersNegatedHelper: boolean;
};

/**
 * Check whether the input is undefined identifier.
 *
 * @param expression - Value to inspect.
 *
 * @returns `true` when the value is undefined identifier; otherwise `false`.
 */

const isUndefinedIdentifier = (expression: TSESTree.Expression): boolean =>
    expression.type === "Identifier" && expression.name === "undefined";

/**
 * GetUndefinedComparisonMatch helper.
 *
 * @param node - Value to inspect.
 *
 * @returns GetUndefinedComparisonMatch helper result.
 */

const getUndefinedComparisonMatch = (
    node: TSESTree.BinaryExpression
): null | UndefinedComparisonMatch => {
    const isPositiveComparison =
        node.operator === "!=" || node.operator === "!==";
    const isNegativeComparison =
        node.operator === "==" || node.operator === "===";

    if (!isPositiveComparison && !isNegativeComparison) {
        return null;
    }

    const prefersNegatedHelper = isNegativeComparison;

    if (isUndefinedIdentifier(node.right)) {
        return {
            comparedExpression: node.left,
            prefersNegatedHelper,
        };
    }

    if (isUndefinedIdentifier(node.left)) {
        return {
            comparedExpression: node.right,
            prefersNegatedHelper,
        };
    }

    if (
        node.left.type === "UnaryExpression" &&
        node.left.operator === "typeof" &&
        node.right.type === "Literal" &&
        node.right.value === "undefined"
    ) {
        return {
            comparedExpression: node.left.argument,
            prefersNegatedHelper,
        };
    }

    if (
        node.right.type === "UnaryExpression" &&
        node.right.operator === "typeof" &&
        node.left.type === "Literal" &&
        node.left.value === "undefined"
    ) {
        return {
            comparedExpression: node.right.argument,
            prefersNegatedHelper,
        };
    }

    return null;
};

/**
 * Check whether the input is filter call.
 *
 * @param expression - Value to inspect.
 *
 * @returns `true` when the value is filter call; otherwise `false`.
 */

const isFilterCall = (
    expression: TSESTree.CallExpression
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
 * Check whether the input is function callback node.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is function callback node; otherwise `false`.
 */

const isFunctionCallbackNode = (
    node: TSESTree.Node
): node is TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression =>
    node.type === "ArrowFunctionExpression" ||
    node.type === "FunctionExpression";

/**
 * GetParentNode helper.
 *
 * @param node - Value to inspect.
 *
 * @returns GetParentNode helper result.
 */

const getParentNode = (node: TSESTree.Node): TSESTree.Node | undefined =>
    (node as NodeWithParent).parent;

/**
 * Check whether the input is within filter callback.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is within filter callback; otherwise `false`.
 */

const isWithinFilterCallback = (node: TSESTree.Node): boolean => {
    let currentNode: TSESTree.Node | undefined = node;

    while (currentNode) {
        if (isFunctionCallbackNode(currentNode)) {
            const callbackParent = getParentNode(currentNode);

            if (
                callbackParent?.type === "CallExpression" &&
                callbackParent.arguments.includes(currentNode) &&
                isFilterCall(callbackParent)
            ) {
                return true;
            }
        }

        currentNode = getParentNode(currentNode);
    }

    return false;
};

/**
 * ESLint rule definition for `prefer-ts-extras-is-defined`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsDefinedRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                BinaryExpression(node) {
                    if (isWithinFilterCallback(node)) {
                        return;
                    }

                    const match = getUndefinedComparisonMatch(node);
                    if (!match) {
                        return;
                    }

                    const comparedExpressionText = context.sourceCode
                        .getText(match.comparedExpression)
                        .trim();

                    if (comparedExpressionText.length === 0) {
                        return;
                    }

                    context.report({
                        messageId: match.prefersNegatedHelper
                            ? "preferTsExtrasIsDefinedNegated"
                            : "preferTsExtrasIsDefined",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras isDefined over inline undefined comparisons outside filter callbacks.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-defined.md",
            },
            messages: {
                preferTsExtrasIsDefined:
                    "Prefer `isDefined(value)` from `ts-extras` over inline undefined comparisons.",
                preferTsExtrasIsDefinedNegated:
                    "Prefer `!isDefined(value)` from `ts-extras` over inline undefined comparisons.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-defined",
    });

/**
 * Default export for the `prefer-ts-extras-is-defined` rule module.
 */
export default preferTsExtrasIsDefinedRule;
