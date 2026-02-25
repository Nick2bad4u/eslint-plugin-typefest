/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-defined`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueArgumentFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const FILTER_METHOD_NAME = "filter";

type NodeWithParent = TSESTree.Node & {
    parent?: TSESTree.Node;
};

type UndefinedComparisonMatch = {
    readonly comparedExpression: TSESTree.Expression;
    readonly prefersNegatedHelper: boolean;
};

const isIdentifierWithName = (
    expression: Readonly<TSESTree.Expression>,
    name: string
): expression is TSESTree.Identifier =>
    expression.type === "Identifier" && expression.name === name;

const isTypeofExpression = (
    expression: Readonly<TSESTree.Expression>
): expression is TSESTree.UnaryExpression & { argument: TSESTree.Expression } =>
    expression.type === "UnaryExpression" && expression.operator === "typeof";

const isUndefinedStringLiteral = (
    expression: Readonly<TSESTree.Expression>
): expression is TSESTree.Literal & { value: "undefined" } =>
    expression.type === "Literal" && expression.value === "undefined";

/**
 * Check whether the input is undefined identifier.
 *
 * @param expression - Value to inspect.
 *
 * @returns `true` when the value is undefined identifier; otherwise `false`.
 */

const isUndefinedIdentifier = (
    expression: Readonly<TSESTree.Expression>
): boolean => isIdentifierWithName(expression, "undefined");

/**
 * GetUndefinedComparisonMatch helper.
 *
 * @param node - Value to inspect.
 *
 * @returns GetUndefinedComparisonMatch helper result.
 */

const getUndefinedComparisonMatch = (
    node: Readonly<TSESTree.BinaryExpression>
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

    if (isTypeofExpression(node.left) && isUndefinedStringLiteral(node.right)) {
        return {
            comparedExpression: node.left.argument,
            prefersNegatedHelper,
        };
    }

    if (isTypeofExpression(node.right) && isUndefinedStringLiteral(node.left)) {
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
    expression: Readonly<TSESTree.CallExpression>
): expression is TSESTree.CallExpression & {
    callee: TSESTree.MemberExpression & {
        computed: false;
        property: TSESTree.Identifier;
    };
} => {
    if (expression.callee.type !== "MemberExpression") {
        return false;
    }

    if (expression.callee.computed) {
        return false;
    }

    if (expression.callee.property.type !== "Identifier") {
        return false;
    }

    return expression.callee.property.name === FILTER_METHOD_NAME;
};

/**
 * Check whether the input is function callback node.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is function callback node; otherwise `false`.
 */

const isFunctionCallbackNode = (
    node: Readonly<TSESTree.Node>
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

const getParentNode = (
    node: Readonly<TSESTree.Node>
): TSESTree.Node | undefined => (node as NodeWithParent).parent;

/**
 * Check whether the input is within filter callback.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is within filter callback; otherwise `false`.
 */

const isWithinFilterCallback = (node: Readonly<TSESTree.Node>): boolean => {
    let currentNode: TSESTree.Node | undefined = node;

    while (currentNode) {
        if (isFunctionCallbackNode(currentNode)) {
            const callbackParent = getParentNode(currentNode);

            if (callbackParent?.type !== "CallExpression") {
                currentNode = getParentNode(currentNode);
                continue;
            }

            if (!callbackParent.arguments.includes(currentNode)) {
                currentNode = getParentNode(currentNode);
                continue;
            }

            if (isFilterCall(callbackParent)) {
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

            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            return {
                BinaryExpression(node) {
                    if (isWithinFilterCallback(node)) {
                        return;
                    }

                    const match = getUndefinedComparisonMatch(node);
                    if (!match) {
                        return;
                    }

                    context.report({
                        fix: createSafeValueArgumentFunctionCallFix({
                            argumentNode: match.comparedExpression,
                            context,
                            importedName: "isDefined",
                            imports: tsExtrasImports,
                            negated: match.prefersNegatedHelper,
                            sourceModuleName: "ts-extras",
                            targetNode: node,
                        }),
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
            deprecated: false,
            docs: {
                description:
                    "require ts-extras isDefined over inline undefined comparisons outside filter callbacks.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-defined.md",
            },
            fixable: "code",
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
