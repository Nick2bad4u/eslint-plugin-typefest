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
    expression: TSESTree.Expression
): readonly TSESTree.Expression[] => {
    if (
        expression.type !== "LogicalExpression" ||
        expression.operator !== "&&"
    ) {
        return [expression];
    }

    return [
        ...flattenLogicalAndTerms(expression.left),
        ...flattenLogicalAndTerms(expression.right),
    ];
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
    node: TSESTree.Expression,
    parameterName: string
): node is TSESTree.BinaryExpression =>
    node.type === "BinaryExpression" &&
    (node.operator === "!=" || node.operator === "!==") &&
    ((node.left.type === "Identifier" &&
        node.left.name === parameterName &&
        node.right.type === "Literal" &&
        node.right.value === null) ||
        (node.right.type === "Identifier" &&
            node.right.name === parameterName &&
            node.left.type === "Literal" &&
            node.left.value === null));

/**
 * Check whether the input is undefined comparison.
 *
 * @param node - Value to inspect.
 * @param parameterName - Value to inspect.
 *
 * @returns `true` when the value is undefined comparison; otherwise `false`.
 */

const isUndefinedComparison = (
    node: TSESTree.Expression,
    parameterName: string
): node is TSESTree.BinaryExpression => {
    if (
        node.type !== "BinaryExpression" ||
        (node.operator !== "!=" && node.operator !== "!==")
    ) {
        return false;
    }

    const isDirectUndefinedComparison =
        (node.left.type === "Identifier" &&
            node.left.name === parameterName &&
            node.right.type === "Identifier" &&
            node.right.name === "undefined") ||
        (node.right.type === "Identifier" &&
            node.right.name === parameterName &&
            node.left.type === "Identifier" &&
            node.left.name === "undefined");

    if (isDirectUndefinedComparison) {
        return true;
    }

    return (
        node.left.type === "UnaryExpression" &&
        node.left.operator === "typeof" &&
        node.left.argument.type === "Identifier" &&
        node.left.argument.name === parameterName &&
        node.right.type === "Literal" &&
        node.right.value === "undefined"
    );
};

type NullishInequalityPart = {
    readonly expression: TSESTree.Expression;
    readonly kind: "null" | "undefined";
    readonly operator: "!=" | "!==";
};

/**
 * ExtractNullishInequalityPart helper.
 *
 * @param expression - Value to inspect.
 * @param parameterName - Value to inspect.
 *
 * @returns ExtractNullishInequalityPart helper result.
 */
const extractNullishInequalityPart = (
    expression: TSESTree.Expression,
    parameterName: string
): null | NullishInequalityPart => {
    if (expression.type !== "BinaryExpression") {
        return null;
    }

    if (expression.operator !== "!=" && expression.operator !== "!==") {
        return null;
    }

    if (
        expression.left.type === "Identifier" &&
        expression.left.name === parameterName &&
        expression.right.type === "Literal" &&
        expression.right.value === null
    ) {
        return {
            expression: expression.left,
            kind: "null",
            operator: expression.operator,
        };
    }

    if (
        expression.right.type === "Identifier" &&
        expression.right.name === parameterName &&
        expression.left.type === "Literal" &&
        expression.left.value === null
    ) {
        return {
            expression: expression.right,
            kind: "null",
            operator: expression.operator,
        };
    }

    if (
        expression.left.type === "Identifier" &&
        expression.left.name === parameterName &&
        expression.right.type === "Identifier" &&
        expression.right.name === "undefined"
    ) {
        return {
            expression: expression.left,
            kind: "undefined",
            operator: expression.operator,
        };
    }

    if (
        expression.right.type === "Identifier" &&
        expression.right.name === parameterName &&
        expression.left.type === "Identifier" &&
        expression.left.name === "undefined"
    ) {
        return {
            expression: expression.right,
            kind: "undefined",
            operator: expression.operator,
        };
    }

    if (
        expression.left.type === "UnaryExpression" &&
        expression.left.operator === "typeof" &&
        expression.left.argument.type === "Identifier" &&
        expression.left.argument.name === parameterName &&
        expression.right.type === "Literal" &&
        expression.right.value === "undefined"
    ) {
        return {
            expression: expression.left.argument,
            kind: "undefined",
            operator: expression.operator,
        };
    }

    return null;
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
    callback: TSESTree.ArrowFunctionExpression & { body: TSESTree.Expression },
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
}: {
    callback: TSESTree.ArrowFunctionExpression & { body: TSESTree.Expression };
    parameterName: string;
    sourceCode: Readonly<TSESLint.SourceCode>;
}): boolean => {
    const { body } = callback;

    const singlePart = extractNullishInequalityPart(body, parameterName);
    if (singlePart?.operator === "!=") {
        return true;
    }

    if (body.type !== "LogicalExpression" || body.operator !== "&&") {
        return false;
    }

    const andTerms = flattenLogicalAndTerms(body);
    if (andTerms.length !== 2) {
        return false;
    }

    const [firstTerm, secondTerm] = andTerms;
    if (!firstTerm || !secondTerm) {
        return false;
    }

    const first = extractNullishInequalityPart(firstTerm, parameterName);
    const second = extractNullishInequalityPart(secondTerm, parameterName);

    if (!first || !second) {
        return false;
    }

    if (first.operator !== "!==" || second.operator !== "!==") {
        return false;
    }

    if (first.kind === second.kind) {
        return false;
    }

    return (
        sourceCode.getText(first.expression).trim() ===
        sourceCode.getText(second.expression).trim()
    );
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

                    if (
                        callee.type !== "MemberExpression" ||
                        callee.computed ||
                        callee.property.type !== "Identifier" ||
                        callee.property.name !== "filter" ||
                        node.arguments.length === 0
                    ) {
                        return;
                    }

                    const callback = node.arguments[0];

                    if (
                        callback?.type !== "ArrowFunctionExpression" ||
                        callback.params.length !== 1 ||
                        callback.body.type === "BlockStatement"
                    ) {
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
