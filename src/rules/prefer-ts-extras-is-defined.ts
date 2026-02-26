/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-defined`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { isWithinFilterCallback } from "../_internal/filter-callback.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueArgumentFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

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
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-defined",
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
