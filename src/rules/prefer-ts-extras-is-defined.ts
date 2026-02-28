/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-defined`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { isWithinFilterCallback } from "../_internal/filter-callback.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueArgumentFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import {
    createTypedRule,
    isGlobalUndefinedIdentifier,
    isTestFilePath,
} from "../_internal/typed-rule.js";

/** Concrete rule context type inferred from `createTypedRule`. */
type RuleContext = Readonly<
    Parameters<ReturnType<typeof createTypedRule>["create"]>[0]
>;

/**
 * Matched undefined-comparison metadata used to produce the replacement.
 */
type UndefinedComparisonMatch = {
    readonly comparedExpression: TSESTree.Expression;
    readonly prefersNegatedHelper: boolean;
};

/**
 * Narrow an expression to an Identifier with an expected name.
 */
const isIdentifierWithName = (
    expression: Readonly<TSESTree.Expression>,
    name: string
): expression is TSESTree.Identifier =>
    expression.type === "Identifier" && expression.name === name;

/**
 * Narrow an expression to a `typeof ...` unary expression.
 */
const isTypeofExpression = (
    expression: Readonly<TSESTree.Expression>
): expression is TSESTree.UnaryExpression & { argument: TSESTree.Expression } =>
    expression.type === "UnaryExpression" && expression.operator === "typeof";

/**
 * Check whether an identifier expression resolves to a bound symbol in scope.
 *
 * @remarks
 * This prevents rewriting `typeof` checks where the identifier would be treated
 * as an unbound global reference.
 */
const isBoundIdentifierReference = (
    context: RuleContext,
    expression: Readonly<TSESTree.Expression>
): boolean => {
    if (expression.type !== "Identifier") {
        return true;
    }

    try {
        let currentScope: null | TSESLint.Scope.Scope =
            context.sourceCode.getScope(expression);

        while (currentScope !== null) {
            const variable = currentScope.set.get(expression.name);
            if (variable !== undefined) {
                return variable.defs.length > 0;
            }

            currentScope = currentScope.upper;
        }
    } catch {
        return false;
    }

    return false;
};

/**
 * Narrow an expression to the string literal `"undefined"`.
 */
const isUndefinedStringLiteral = (
    expression: Readonly<TSESTree.Expression>
): expression is TSESTree.Literal & { value: "undefined" } =>
    expression.type === "Literal" && expression.value === "undefined";

/**
 * Determine whether an expression references the global `undefined` binding.
 *
 * @param context - Active rule context for scope resolution.
 * @param expression - Expression node to inspect.
 *
 * @returns `true` when the expression is an unshadowed `undefined` identifier.
 */
const isUndefinedIdentifier = (
    context: RuleContext,
    expression: Readonly<TSESTree.Expression>
): boolean =>
    isIdentifierWithName(expression, "undefined") &&
    isGlobalUndefinedIdentifier(context, expression);

/**
 * Match supported undefined-comparison patterns used by this rule.
 *
 * @param context - Active rule context for global-binding checks.
 * @param node - Binary expression to inspect.
 *
 * @returns Comparison metadata when the expression is supported; otherwise
 *   `null`.
 */
const getUndefinedComparisonMatch = (
    context: RuleContext,
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

    if (isUndefinedIdentifier(context, node.right)) {
        return {
            comparedExpression: node.left,
            prefersNegatedHelper,
        };
    }

    if (isUndefinedIdentifier(context, node.left)) {
        return {
            comparedExpression: node.right,
            prefersNegatedHelper,
        };
    }

    if (isTypeofExpression(node.left) && isUndefinedStringLiteral(node.right)) {
        if (!isBoundIdentifierReference(context, node.left.argument)) {
            return null;
        }

        return {
            comparedExpression: node.left.argument,
            prefersNegatedHelper,
        };
    }

    if (isTypeofExpression(node.right) && isUndefinedStringLiteral(node.left)) {
        if (!isBoundIdentifierReference(context, node.right.argument)) {
            return null;
        }

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

                    const match = getUndefinedComparisonMatch(context, node);
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
