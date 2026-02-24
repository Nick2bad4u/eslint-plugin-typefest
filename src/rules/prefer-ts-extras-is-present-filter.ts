/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-present-filter`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * FlattenLogicalAndTerms helper.
 *
 * @param expression - Value to inspect.
 *
 * @returns FlattenLogicalAndTerms helper result.
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

type NullishInequalityPart = {
    readonly expression: TSESTree.Expression;
    readonly kind: "null" | "undefined";
    readonly operator: "!=" | "!==";
};

const isIdentifierWithName = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>,
    name: string
): node is TSESTree.Identifier =>
    node.type === "Identifier" && node.name === name;

const isNullLiteral = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>
): node is TSESTree.Literal & { value: null } =>
    node.type === "Literal" && node.value === null;

const isUndefinedStringLiteral = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>
): node is TSESTree.Literal & { value: "undefined" } =>
    node.type === "Literal" && node.value === "undefined";

const isTypeofParameter = (
    node: Readonly<TSESTree.Expression>,
    parameterName: string
): node is TSESTree.UnaryExpression & { argument: TSESTree.Identifier } =>
    node.type === "UnaryExpression" &&
    node.operator === "typeof" &&
    isIdentifierWithName(node.argument, parameterName);

/**
 * ExtractNullishInequalityPart helper.
 *
 * @param expression - Value to inspect.
 * @param parameterName - Value to inspect.
 *
 * @returns ExtractNullishInequalityPart helper result.
 */
const extractNullishInequalityPart = (
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

        if (isIdentifierWithName(expression.right, "undefined")) {
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

        if (isIdentifierWithName(expression.left, "undefined")) {
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
 * Check whether the input is null comparison.
 *
 * @param node - Value to inspect.
 * @param parameterName - Value to inspect.
 *
 * @returns `true` when the value is null comparison; otherwise `false`.
 */

const isNullComparison = (
    node: Readonly<TSESTree.Expression>,
    parameterName: string
): node is TSESTree.BinaryExpression => {
    const comparison = extractNullishInequalityPart(node, parameterName);

    return comparison?.kind === "null";
};

/**
 * Check whether the input is undefined comparison.
 *
 * @param node - Value to inspect.
 * @param parameterName - Value to inspect.
 *
 * @returns `true` when the value is undefined comparison; otherwise `false`.
 */

const isUndefinedComparison = (
    node: Readonly<TSESTree.Expression>,
    parameterName: string
): node is TSESTree.BinaryExpression => {
    const comparison = extractNullishInequalityPart(node, parameterName);

    return comparison?.kind === "undefined";
};

/**
 * Check whether the input is nullish filter guard body.
 *
 * @param callback - Value to inspect.
 * @param parameterName - Value to inspect.
 *
 * @returns `true` when the value is nullish filter guard body; otherwise
 *   `false`.
 */

const isNullishFilterGuardBody = (
    callback: Readonly<
        TSESTree.ArrowFunctionExpression & { body: TSESTree.Expression }
    >,
    parameterName: string
): boolean => {
    const { body } = callback;

    if (
        isNullComparison(body, parameterName) ||
        isUndefinedComparison(body, parameterName)
    ) {
        if (body.operator === "!=") {
            return true;
        }

        return callback.returnType?.typeAnnotation.type === "TSTypePredicate";
    }

    const andTerms = flattenLogicalAndTerms(body);
    const hasNullComparison = andTerms.some((term) =>
        isNullComparison(term, parameterName)
    );
    const hasUndefinedComparison = andTerms.some((term) =>
        isUndefinedComparison(term, parameterName)
    );

    return hasNullComparison && hasUndefinedComparison;
};

/**
 * Check whether the callback is safe to auto-fix directly to `isPresent`.
 *
 * @param callback - Value to inspect.
 * @param parameterName - Value to inspect.
 * @param sourceCode - Value to inspect.
 *
 * @returns `true` when the callback is safely auto-fixable; otherwise `false`.
 */
const isSafePresentFilterAutoFixableCallback = ({
    callback,
    parameterName,
    sourceCode,
}: Readonly<{
    callback: TSESTree.ArrowFunctionExpression & { body: TSESTree.Expression };
    parameterName: string;
    sourceCode: Readonly<TSESLint.SourceCode>;
}>): boolean => {
    const { body } = callback;

    const singlePart = extractNullishInequalityPart(body, parameterName);
    if (singlePart?.operator === "!=") {
        return true;
    }

    if (body.type !== "LogicalExpression") {
        return false;
    }

    if (body.operator !== "&&") {
        return false;
    }

    const andTerms = flattenLogicalAndTerms(body);
    if (andTerms.length !== 2) {
        return false;
    }

    const [firstTerm, secondTerm] = andTerms as readonly [
        TSESTree.Expression,
        TSESTree.Expression,
    ];

    const first = extractNullishInequalityPart(firstTerm, parameterName);
    const second = extractNullishInequalityPart(secondTerm, parameterName);

    if (first?.operator !== "!==" || second?.operator !== "!==") {
        return false;
    }

    const normalizedFirstText = sourceCode
        .getText(first.expression)
        .replaceAll(/\s/gu, "");
    const normalizedSecondText = sourceCode
        .getText(second.expression)
        .replaceAll(/\s/gu, "");

    return normalizedFirstText === normalizedSecondText;
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
                            expressionCallback,
                            parameter.name
                        )
                    ) {
                        return;
                    }

                    const isAutoFixable =
                        isSafePresentFilterAutoFixableCallback({
                            callback: expressionCallback,
                            parameterName: parameter.name,
                            sourceCode: context.sourceCode,
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
            docs: {
                description:
                    "require ts-extras isPresent in Array.filter callbacks instead of inline nullish checks.",
                recommended: [
                    "typefest.configs.minimal",
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-present-filter.md",
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
