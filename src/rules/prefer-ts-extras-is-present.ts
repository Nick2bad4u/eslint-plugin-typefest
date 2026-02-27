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

type NullishComparison = {
    readonly comparedExpression: TSESTree.Expression;
    readonly kind: NullishKind;
    readonly operator: "!=" | "!==" | "==" | "===";
};

type NullishKind = "null" | "undefined";

type RuleContext = Readonly<
    Parameters<ReturnType<typeof createTypedRule>["create"]>[0]
>;

/**
 * FlattenLogicalTerms helper.
 *
 * @param value - Value to inspect.
 *
 * @returns FlattenLogicalTerms helper result.
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
 * Check whether the input is undefined identifier.
 *
 * @param expression - Value to inspect.
 *
 * @returns `true` when the value is undefined identifier; otherwise `false`.
 */

const isUndefinedIdentifier = (
    context: RuleContext,
    expression: Readonly<TSESTree.Expression>
): boolean =>
    expression.type === "Identifier" &&
    expression.name === "undefined" &&
    isGlobalUndefinedIdentifier(context, expression);

/**
 * GetNullishComparison helper.
 *
 * @param expression - Value to inspect.
 *
 * @returns GetNullishComparison helper result.
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
 * Check whether two comparisons share the same compared expression.
 *
 * @param value - Value to inspect.
 *
 * @returns `true` when both sides have same compared expression; otherwise
 *   `false`.
 */

const haveSameComparedExpression = ({
    first,
    second,
}: Readonly<{
    first: TSESTree.Expression;
    second: TSESTree.Expression;
}>): boolean => areEquivalentExpressions(first, second);

/**
 * Check whether the input is strict present check.
 *
 * @param value - Value to inspect.
 *
 * @returns `true` when the value is strict present check; otherwise `false`.
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
 * Check whether the input is strict absent check.
 *
 * @param value - Value to inspect.
 *
 * @returns `true` when the value is strict absent check; otherwise `false`.
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
