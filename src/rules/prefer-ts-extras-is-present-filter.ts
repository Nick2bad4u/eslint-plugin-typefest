/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-present-filter`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { areEquivalentExpressions } from "../_internal/normalize-expression-text.js";
import {
    createTypedRule,
    isGlobalUndefinedIdentifier,
    isTestFilePath,
} from "../_internal/typed-rule.js";

/**
 * Flatten a left-associative `&&` expression tree into a linear term list.
 *
 * @param expression - Expression to inspect.
 *
 * @returns Individual conjunction terms, or a single-item array when the
 *   expression is not a logical-and chain.
 */
const flattenLogicalAndTerms = (
    expression: Readonly<TSESTree.Expression>
): readonly TSESTree.Expression[] => {
    if (expression.type !== "LogicalExpression") {
        return [expression];
    }

    if (expression.operator !== "&&") {
        return [expression];
    }

    return [
        ...flattenLogicalAndTerms(expression.left),
        ...flattenLogicalAndTerms(expression.right),
    ];
};

/**
 * Normalized metadata for one nullish inequality comparison part.
 */
type NullishInequalityPart = {
    readonly expression: TSESTree.Expression;
    readonly kind: "null" | "undefined";
    readonly operator: "!=" | "!==";
};

/** Concrete rule context type inferred from `createTypedRule`. */
type RuleContext = Readonly<
    Parameters<ReturnType<typeof createTypedRule>["create"]>[0]
>;

/**
 * Narrow a node to an Identifier with an expected name.
 */
const isIdentifierWithName = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>,
    name: string
): node is TSESTree.Identifier =>
    node.type === "Identifier" && node.name === name;

/**
 * Narrow a node to the `null` literal.
 */
const isNullLiteral = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>
): node is TSESTree.Literal & { value: null } =>
    node.type === "Literal" && node.value === null;

/**
 * Narrow a node to the string literal `"undefined"`.
 */
const isUndefinedStringLiteral = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>
): node is TSESTree.Literal & { value: "undefined" } =>
    node.type === "Literal" && node.value === "undefined";

/**
 * Narrow an expression to `typeof <parameterName>`.
 */
const isTypeofParameter = (
    node: Readonly<TSESTree.Expression>,
    parameterName: string
): node is TSESTree.UnaryExpression & { argument: TSESTree.Identifier } =>
    node.type === "UnaryExpression" &&
    node.operator === "typeof" &&
    isIdentifierWithName(node.argument, parameterName);

/**
 * Extract one nullish inequality comparison part from an expression.
 *
 * @param context - Active rule context for global-binding checks.
 * @param expression - Expression to inspect.
 * @param parameterName - Callback parameter name.
 *
 * @returns Comparison metadata when matched; otherwise `null`.
 */
const extractNullishInequalityPart = (
    context: RuleContext,
    expression: Readonly<TSESTree.Expression>,
    parameterName: string
): null | NullishInequalityPart => {
    if (expression.type !== "BinaryExpression") {
        return null;
    }

    if (expression.operator !== "!=" && expression.operator !== "!==") {
        return null;
    }

    if (isIdentifierWithName(expression.left, parameterName)) {
        if (isNullLiteral(expression.right)) {
            return {
                expression: expression.left,
                kind: "null",
                operator: expression.operator,
            };
        }

        if (
            expression.right.type === "Identifier" &&
            isGlobalUndefinedIdentifier(context, expression.right)
        ) {
            return {
                expression: expression.left,
                kind: "undefined",
                operator: expression.operator,
            };
        }
    }

    if (isIdentifierWithName(expression.right, parameterName)) {
        if (isNullLiteral(expression.left)) {
            return {
                expression: expression.right,
                kind: "null",
                operator: expression.operator,
            };
        }

        if (
            expression.left.type === "Identifier" &&
            isGlobalUndefinedIdentifier(context, expression.left)
        ) {
            return {
                expression: expression.right,
                kind: "undefined",
                operator: expression.operator,
            };
        }
    }

    if (
        isTypeofParameter(expression.left, parameterName) &&
        isUndefinedStringLiteral(expression.right)
    ) {
        return {
            expression: expression.left.argument,
            kind: "undefined",
            operator: expression.operator,
        };
    }

    if (
        isTypeofParameter(expression.right, parameterName) &&
        isUndefinedStringLiteral(expression.left)
    ) {
        return {
            expression: expression.right.argument,
            kind: "undefined",
            operator: expression.operator,
        };
    }

    return null;
};

/**
 * Check whether an expression contains a supported null-inequality comparison
 * part for the callback parameter.
 *
 * @param context - Active rule context for global-binding checks.
 * @param node - Expression to inspect.
 * @param parameterName - Callback parameter name.
 *
 * @returns `true` when the expression represents a null comparison.
 */
const isNullComparison = (
    context: RuleContext,
    node: Readonly<TSESTree.Expression>,
    parameterName: string
): node is TSESTree.BinaryExpression => {
    const comparison = extractNullishInequalityPart(
        context,
        node,
        parameterName
    );

    return comparison?.kind === "null";
};

/**
 * Check whether an expression contains a supported undefined-inequality
 * comparison part for the callback parameter.
 *
 * @param context - Active rule context for global-binding checks.
 * @param node - Expression to inspect.
 * @param parameterName - Callback parameter name.
 *
 * @returns `true` when the expression represents an undefined comparison.
 */
const isUndefinedComparison = (
    context: RuleContext,
    node: Readonly<TSESTree.Expression>,
    parameterName: string
): node is TSESTree.BinaryExpression => {
    const comparison = extractNullishInequalityPart(
        context,
        node,
        parameterName
    );

    return comparison?.kind === "undefined";
};

/**
 * Check whether a filter callback body is a supported nullish guard pattern.
 *
 * @param context - Active rule context for global-binding checks.
 * @param callback - Arrow callback to inspect.
 * @param parameterName - Callback parameter name.
 *
 * @returns `true` when the callback can be replaced by `isPresent` (with
 *   possible suggestion fallback based on strictness of operators).
 */
const isNullishFilterGuardBody = (
    context: RuleContext,
    callback: Readonly<
        TSESTree.ArrowFunctionExpression & { body: TSESTree.Expression }
    >,
    parameterName: string
): boolean => {
    const { body } = callback;

    if (
        isNullComparison(context, body, parameterName) ||
        isUndefinedComparison(context, body, parameterName)
    ) {
        if (body.operator === "!=") {
            return true;
        }

        return callback.returnType?.typeAnnotation.type === "TSTypePredicate";
    }

    const andTerms = flattenLogicalAndTerms(body);
    const hasNullComparison = andTerms.some((term) =>
        isNullComparison(context, term, parameterName)
    );
    const hasUndefinedComparison = andTerms.some((term) =>
        isUndefinedComparison(context, term, parameterName)
    );

    return hasNullComparison && hasUndefinedComparison;
};

/**
 * Check whether the callback is safe to auto-fix directly to `isPresent`.
 *
 * @param callback - Arrow callback to inspect.
 * @param context - Active rule context for global-binding checks.
 * @param parameterName - Callback parameter name.
 *
 * @returns `true` when the callback is safely auto-fixable; otherwise `false`.
 */
const isSafePresentFilterAutoFixableCallback = ({
    callback,
    context,
    parameterName,
}: Readonly<{
    callback: TSESTree.ArrowFunctionExpression & { body: TSESTree.Expression };
    context: RuleContext;
    parameterName: string;
}>): boolean => {
    const { body } = callback;

    const singlePart = extractNullishInequalityPart(
        context,
        body,
        parameterName
    );
    if (singlePart?.operator === "!=") {
        return true;
    }

    if (body.type !== "LogicalExpression") {
        return false;
    }

    /* V8 ignore start -- reachable only when body is a logical expression that
         survived nullish-guard detection; current guard logic only admits `&&`. */
    if (body.operator !== "&&") {
        return false;
    }
    /* V8 ignore stop */

    const andTerms = flattenLogicalAndTerms(body);
    if (andTerms.length !== 2) {
        return false;
    }

    const [firstTerm, secondTerm] = andTerms as readonly [
        TSESTree.Expression,
        TSESTree.Expression,
    ];

    const first = extractNullishInequalityPart(
        context,
        firstTerm,
        parameterName
    );
    const second = extractNullishInequalityPart(
        context,
        secondTerm,
        parameterName
    );

    if (first?.operator !== "!==" || second?.operator !== "!==") {
        return false;
    }

    return areEquivalentExpressions(first.expression, second.expression);
};

/**
 * ESLint rule definition for `prefer-ts-extras-is-present-filter`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsPresentFilterRule: ReturnType<typeof createTypedRule> =
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
                CallExpression(node) {
                    const { callee } = node;

                    if (callee.type !== "MemberExpression") {
                        return;
                    }

                    if (callee.computed) {
                        return;
                    }

                    if (callee.property.type !== "Identifier") {
                        return;
                    }

                    if (callee.property.name !== "filter") {
                        return;
                    }

                    const callback = node.arguments[0];

                    if (callback?.type !== "ArrowFunctionExpression") {
                        return;
                    }

                    if (callback.params.length !== 1) {
                        return;
                    }

                    if (callback.body.type === "BlockStatement") {
                        return;
                    }

                    const parameter = callback.params[0];
                    if (parameter?.type !== "Identifier") {
                        return;
                    }

                    const expressionCallback =
                        callback as TSESTree.ArrowFunctionExpression & {
                            body: TSESTree.Expression;
                        };

                    if (
                        !isNullishFilterGuardBody(
                            context,
                            expressionCallback,
                            parameter.name
                        )
                    ) {
                        return;
                    }

                    const isAutoFixable =
                        isSafePresentFilterAutoFixableCallback({
                            callback: expressionCallback,
                            context,
                            parameterName: parameter.name,
                        });

                    context.report({
                        fix: isAutoFixable
                            ? createSafeValueReferenceReplacementFix({
                                  context,
                                  importedName: "isPresent",
                                  imports: tsExtrasImports,
                                  sourceModuleName: "ts-extras",
                                  targetNode: expressionCallback,
                              })
                            : null,
                        messageId: "preferTsExtrasIsPresentFilter",
                        node: expressionCallback,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras isPresent in Array.filter callbacks instead of inline nullish checks.",
                frozen: false,
                recommended: [
                    "typefest.configs.minimal",
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-present-filter",
            },
            fixable: "code",
            messages: {
                preferTsExtrasIsPresentFilter:
                    "Prefer `isPresent` from `ts-extras` in `filter(...)` callbacks over inline nullish comparisons.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-present-filter",
    });

/**
 * Default export for the `prefer-ts-extras-is-present-filter` rule module.
 */
export default preferTsExtrasIsPresentFilterRule;
