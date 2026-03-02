/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-present`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { isWithinFilterCallback } from "../_internal/filter-callback.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueArgumentFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import { areEquivalentExpressions } from "../_internal/normalize-expression-text.js";
import {
    createTypedRule,
    isGlobalUndefinedIdentifier,
    isTestFilePath,
} from "../_internal/typed-rule.js";

/**
 * Normalized view of a nullish equality/inequality comparison.
 */
type NullishComparison = {
    readonly comparedExpression: TSESTree.Expression;
    readonly kind: NullishKind;
    readonly operator: "!=" | "!==" | "==" | "===";
};

/**
 * Nullish literal kinds that can appear in supported comparisons.
 */
type NullishKind = "null" | "undefined";

/**
 * Concrete rule context type derived from `createTypedRule`.
 */
type RuleContext = Readonly<
    Parameters<ReturnType<typeof createTypedRule>["create"]>[0]
>;

/**
 * Flattens chained logical expressions that use a single operator.
 *
 * @param options - Expression/operator pair used to collect linear terms.
 *
 * @returns A left-to-right list of leaf expressions that share the same logical
 *   operator.
 */

const flattenLogicalTerms = ({
    expression,
    operator,
}: Readonly<{
    expression: TSESTree.Expression;
    operator: "&&" | "||";
}>): readonly TSESTree.Expression[] => {
    if (expression.type !== "LogicalExpression") {
        return [expression];
    }

    if (expression.operator !== operator) {
        return [expression];
    }

    return [
        ...flattenLogicalTerms({
            expression: expression.left,
            operator,
        }),
        ...flattenLogicalTerms({
            expression: expression.right,
            operator,
        }),
    ];
};

/**
 * Check whether an expression is the global `undefined` identifier.
 *
 * @param context - Rule context used for global-identifier resolution.
 * @param expression - Expression node to inspect.
 *
 * @returns `true` when the expression references unshadowed global `undefined`.
 */
const isUndefinedIdentifier = (
    context: RuleContext,
    expression: Readonly<TSESTree.Expression>
): boolean =>
    expression.type === "Identifier" &&
    expression.name === "undefined" &&
    isGlobalUndefinedIdentifier(context, expression);

/**
 * Converts a binary comparison against `null`/`undefined` into a normalized
 * structure.
 *
 * @param context - Rule context used to verify global `undefined` references.
 * @param expression - Binary expression candidate.
 *
 * @returns Parsed comparison data when the expression is a supported nullish
 *   comparison; otherwise `null`.
 */

const getNullishComparison = (
    context: RuleContext,
    expression: Readonly<TSESTree.Expression>
): null | NullishComparison => {
    if (expression.type !== "BinaryExpression") {
        return null;
    }

    if (
        expression.operator !== "!=" &&
        expression.operator !== "!==" &&
        expression.operator !== "==" &&
        expression.operator !== "==="
    ) {
        return null;
    }

    if (
        expression.right.type === "Literal" &&
        expression.right.value === null
    ) {
        return {
            comparedExpression: expression.left,
            kind: "null",
            operator: expression.operator,
        };
    }

    if (expression.left.type === "Literal" && expression.left.value === null) {
        return {
            comparedExpression: expression.right,
            kind: "null",
            operator: expression.operator,
        };
    }

    if (isUndefinedIdentifier(context, expression.right)) {
        return {
            comparedExpression: expression.left,
            kind: "undefined",
            operator: expression.operator,
        };
    }

    if (isUndefinedIdentifier(context, expression.left)) {
        return {
            comparedExpression: expression.right,
            kind: "undefined",
            operator: expression.operator,
        };
    }

    return null;
};

/**
 * Checks whether two expressions are syntactically equivalent targets.
 *
 * @param options - Pair of expressions to compare.
 *
 * @returns `true` when both expressions resolve to the same normalized text.
 */

const haveSameComparedExpression = ({
    first,
    second,
}: Readonly<{
    first: TSESTree.Expression;
    second: TSESTree.Expression;
}>): boolean => areEquivalentExpressions(first, second);

/**
 * Detects the strict two-term present check pattern: value !== null && value
 * !== undefined.
 *
 * @param options - Context plus logical expression to inspect.
 *
 * @returns `true` when the logical expression is a strict present check.
 */

const isStrictPresentCheck = ({
    context,
    node,
}: Readonly<{
    context: RuleContext;
    node: TSESTree.LogicalExpression;
}>): boolean => {
    if (node.operator !== "&&") {
        return false;
    }

    const terms = flattenLogicalTerms({
        expression: node,
        operator: "&&",
    });

    if (terms.length !== 2) {
        return false;
    }

    const [firstTerm, secondTerm] = terms as readonly [
        TSESTree.Expression,
        TSESTree.Expression,
    ];

    const first = getNullishComparison(context, firstTerm);
    const second = getNullishComparison(context, secondTerm);

    if (!first || !second) {
        return false;
    }

    if (first.operator !== "!==" || second.operator !== "!==") {
        return false;
    }

    if (first.kind === second.kind) {
        return false;
    }

    return haveSameComparedExpression({
        first: first.comparedExpression,
        second: second.comparedExpression,
    });
};

/**
 * Detects the strict two-term absent check pattern: `value === null || value
 * === undefined`.
 *
 * @param options - Context plus logical expression to inspect.
 *
 * @returns `true` when the logical expression is a strict absent check.
 */

const isStrictAbsentCheck = ({
    context,
    node,
}: Readonly<{
    context: RuleContext;
    node: TSESTree.LogicalExpression;
}>): boolean => {
    if (node.operator !== "||") {
        return false;
    }

    const terms = flattenLogicalTerms({
        expression: node,
        operator: "||",
    });

    if (terms.length !== 2) {
        return false;
    }

    const [firstTerm, secondTerm] = terms as readonly [
        TSESTree.Expression,
        TSESTree.Expression,
    ];

    const first = getNullishComparison(context, firstTerm);
    const second = getNullishComparison(context, secondTerm);

    if (!first || !second) {
        return false;
    }

    if (first.operator !== "===" || second.operator !== "===") {
        return false;
    }

    if (first.kind === second.kind) {
        return false;
    }

    return haveSameComparedExpression({
        first: first.comparedExpression,
        second: second.comparedExpression,
    });
};

/**
 * ESLint rule definition for `prefer-ts-extras-is-present`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsPresentRule: ReturnType<typeof createTypedRule> =
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

                    const comparison = getNullishComparison(context, node);
                    if (comparison?.kind !== "null") {
                        return;
                    }

                    if (comparison.operator === "!=") {
                        context.report({
                            fix: createSafeValueArgumentFunctionCallFix({
                                argumentNode: comparison.comparedExpression,
                                context,
                                importedName: "isPresent",
                                imports: tsExtrasImports,
                                sourceModuleName: "ts-extras",
                                targetNode: node,
                            }),
                            messageId: "preferTsExtrasIsPresent",
                            node,
                        });
                    }

                    if (comparison.operator === "==") {
                        context.report({
                            fix: createSafeValueArgumentFunctionCallFix({
                                argumentNode: comparison.comparedExpression,
                                context,
                                importedName: "isPresent",
                                imports: tsExtrasImports,
                                negated: true,
                                sourceModuleName: "ts-extras",
                                targetNode: node,
                            }),
                            messageId: "preferTsExtrasIsPresentNegated",
                            node,
                        });
                    }
                },
                LogicalExpression(node) {
                    if (isWithinFilterCallback(node)) {
                        return;
                    }

                    if (
                        isStrictPresentCheck({
                            context,
                            node,
                        })
                    ) {
                        context.report({
                            messageId: "preferTsExtrasIsPresent",
                            node,
                        });
                        return;
                    }

                    if (
                        isStrictAbsentCheck({
                            context,
                            node,
                        })
                    ) {
                        context.report({
                            messageId: "preferTsExtrasIsPresentNegated",
                            node,
                        });
                    }
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras isPresent over inline nullish comparisons outside filter callbacks.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-present",
            },
            fixable: "code",
            messages: {
                preferTsExtrasIsPresent:
                    "Prefer `isPresent(value)` from `ts-extras` over inline nullish comparisons.",
                preferTsExtrasIsPresentNegated:
                    "Prefer `!isPresent(value)` from `ts-extras` over inline nullish comparisons.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-present",
    });

/**
 * Default export for the `prefer-ts-extras-is-present` rule module.
 */
export default preferTsExtrasIsPresentRule;
