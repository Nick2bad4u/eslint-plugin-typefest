/**
 * @packageDocumentation
 * Shared helpers for parsing and flattening nullish comparison expressions.
 */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { arrayIncludes, isDefined } from "ts-extras";

/**
 * Normalized representation of one binary comparison against null/undefined.
 */
export type NullishComparison = Readonly<{
    comparedExpression: TSESTree.Expression;
    kind: NullishComparisonKind;
    operator: NullishComparisonOperator;
}>;

/** Nullish literal kinds supported by comparison extraction. */
export type NullishComparisonKind = "null" | "undefined";

/** Operators supported by nullish comparison extraction. */
export type NullishComparisonOperator = "!=" | "!==" | "==" | "===";

/** Default accepted operators for nullish comparison parsing. */
const defaultNullishComparisonOperators = [
    "!=",
    "!==",
    "==",
    "===",
] as const satisfies readonly NullishComparisonOperator[];

/**
 * Flatten a logical-expression tree for one specific operator.
 *
 * @param options - Expression and logical operator to flatten.
 *
 * @returns Left-to-right list of terms participating in that operator chain.
 */
export const flattenLogicalTerms = ({
    expression,
    operator,
}: Readonly<{
    expression: Readonly<TSESTree.Expression>;
    operator: "&&" | "||";
}>): readonly TSESTree.Expression[] => {
    const flattenedTerms: TSESTree.Expression[] = [];
    const pendingTerms: TSESTree.Expression[] = [expression];

    while (pendingTerms.length > 0) {
        const currentTerm = pendingTerms.pop();

        if (!currentTerm) {
            continue;
        }

        if (
            currentTerm.type === AST_NODE_TYPES.LogicalExpression &&
            currentTerm.operator === operator
        ) {
            pendingTerms.push(currentTerm.right, currentTerm.left);
            continue;
        }

        flattenedTerms.push(currentTerm);
    }

    return flattenedTerms;
};

const STRICT_NULLISH_TERM_COUNT = 2 as const;

/**
 * Narrow a list of expressions to an exact two-term tuple.
 */
export const isExpressionPair = (
    terms: readonly Readonly<TSESTree.Expression>[]
): terms is readonly [TSESTree.Expression, TSESTree.Expression] =>
    terms.length === STRICT_NULLISH_TERM_COUNT;

/**
 * Check whether an expression is the literal `null`.
 */
const isNullLiteral = (
    expression: Readonly<TSESTree.Expression>
): expression is TSESTree.Literal & { value: null } =>
    expression.type === AST_NODE_TYPES.Literal && expression.value === null;

/**
 * Check whether an expression is the string literal `"undefined"`.
 */
const isUndefinedStringLiteral = (
    expression: Readonly<TSESTree.Expression>
): expression is TSESTree.Literal & { value: "undefined" } =>
    expression.type === AST_NODE_TYPES.Literal &&
    expression.value === "undefined";

/**
 * Check whether an expression is `typeof <identifierName>`.
 */
const isTypeofIdentifierExpression = (
    expression: Readonly<TSESTree.Expression>,
    identifierName: string
): expression is TSESTree.UnaryExpression & { argument: TSESTree.Identifier } =>
    expression.type === AST_NODE_TYPES.UnaryExpression &&
    expression.operator === "typeof" &&
    expression.argument.type === AST_NODE_TYPES.Identifier &&
    expression.argument.name === identifierName;

/**
 * Narrow a binary-operator string to supported nullish comparison operators.
 */
const isAllowedNullishComparisonOperator = (
    operator: TSESTree.BinaryExpression["operator"]
): operator is NullishComparisonOperator =>
    operator === "!=" ||
    operator === "!==" ||
    operator === "==" ||
    operator === "===";

/**
 * Narrow an ESTree expression-like union to regular expressions (excluding
 * private identifiers).
 */
const isExpressionNode = (
    expression: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>
): expression is TSESTree.Expression =>
    expression.type !== AST_NODE_TYPES.PrivateIdentifier;

const getNullLiteralComparison = (
    left: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>,
    right: Readonly<TSESTree.Expression>,
    operator: NullishComparisonOperator,
    matchesComparedExpression: (
        candidateExpression: Readonly<TSESTree.Expression>
    ) => boolean
): null | NullishComparison => {
    if (
        isNullLiteral(right) &&
        isExpressionNode(left) &&
        matchesComparedExpression(left)
    ) {
        return {
            comparedExpression: left,
            kind: "null",
            operator,
        };
    }

    if (
        isExpressionNode(left) &&
        isNullLiteral(left) &&
        matchesComparedExpression(right)
    ) {
        return {
            comparedExpression: right,
            kind: "null",
            operator,
        };
    }

    return null;
};

const getUndefinedIdentifierComparison = (
    left: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>,
    right: Readonly<TSESTree.Expression>,
    operator: NullishComparisonOperator,
    matchesComparedExpression: (
        candidateExpression: Readonly<TSESTree.Expression>
    ) => boolean,
    isGlobalUndefinedIdentifier: (
        expression: Readonly<TSESTree.Expression>
    ) => boolean
): null | NullishComparison => {
    if (
        right.type === AST_NODE_TYPES.Identifier &&
        isGlobalUndefinedIdentifier(right) &&
        isExpressionNode(left) &&
        matchesComparedExpression(left)
    ) {
        return {
            comparedExpression: left,
            kind: "undefined",
            operator,
        };
    }

    if (
        isExpressionNode(left) &&
        left.type === AST_NODE_TYPES.Identifier &&
        isGlobalUndefinedIdentifier(left) &&
        matchesComparedExpression(right)
    ) {
        return {
            comparedExpression: right,
            kind: "undefined",
            operator,
        };
    }

    return null;
};

const getTypeofUndefinedStringComparison = (
    left: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>,
    right: Readonly<TSESTree.Expression>,
    operator: NullishComparisonOperator,
    comparedIdentifierName: string
): null | NullishComparison => {
    if (
        isExpressionNode(left) &&
        isTypeofIdentifierExpression(left, comparedIdentifierName) &&
        isUndefinedStringLiteral(right)
    ) {
        return {
            comparedExpression: left.argument,
            kind: "undefined",
            operator,
        };
    }

    if (
        isExpressionNode(left) &&
        isTypeofIdentifierExpression(right, comparedIdentifierName) &&
        isUndefinedStringLiteral(left)
    ) {
        return {
            comparedExpression: right.argument,
            kind: "undefined",
            operator,
        };
    }

    return null;
};

/**
 * Extract a normalized nullish comparison from an expression.
 */
export const getNullishComparison = ({
    allowedOperators = defaultNullishComparisonOperators,
    allowTypeofComparedIdentifierForUndefined = false,
    comparedIdentifierName,
    expression,
    isGlobalUndefinedIdentifier,
}: Readonly<{
    allowedOperators?: readonly NullishComparisonOperator[];
    allowTypeofComparedIdentifierForUndefined?: boolean;
    comparedIdentifierName?: string;
    expression: Readonly<TSESTree.Expression>;
    isGlobalUndefinedIdentifier: (
        expression: Readonly<TSESTree.Expression>
    ) => boolean;
}>): null | NullishComparison => {
    if (expression.type !== AST_NODE_TYPES.BinaryExpression) {
        return null;
    }

    if (!isAllowedNullishComparisonOperator(expression.operator)) {
        return null;
    }

    if (
        allowedOperators !== defaultNullishComparisonOperators &&
        !arrayIncludes(allowedOperators, expression.operator)
    ) {
        return null;
    }

    const matchesComparedExpression = (
        candidateExpression: Readonly<TSESTree.Expression>
    ): boolean =>
        !isDefined(comparedIdentifierName) ||
        (candidateExpression.type === AST_NODE_TYPES.Identifier &&
            candidateExpression.name === comparedIdentifierName);

    const nullLiteralComparison = getNullLiteralComparison(
        expression.left,
        expression.right,
        expression.operator,
        matchesComparedExpression
    );
    if (nullLiteralComparison !== null) {
        return nullLiteralComparison;
    }

    const undefinedIdentifierComparison = getUndefinedIdentifierComparison(
        expression.left,
        expression.right,
        expression.operator,
        matchesComparedExpression,
        isGlobalUndefinedIdentifier
    );
    if (undefinedIdentifierComparison !== null) {
        return undefinedIdentifierComparison;
    }

    if (
        !isDefined(comparedIdentifierName) ||
        !allowTypeofComparedIdentifierForUndefined
    ) {
        return null;
    }

    return getTypeofUndefinedStringComparison(
        expression.left,
        expression.right,
        expression.operator,
        comparedIdentifierName
    );
};
