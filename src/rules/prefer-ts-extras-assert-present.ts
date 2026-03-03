/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-assert-present`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueNodeTextReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { areEquivalentExpressions } from "../_internal/normalize-expression-text.js";
import {
    createTypedRule,
    isGlobalIdentifierNamed,
    isGlobalUndefinedIdentifier,
    isTestFilePath,
} from "../_internal/typed-rule.js";

/** Concrete rule context type inferred from `createTypedRule`. */
type RuleContext = Readonly<
    Parameters<ReturnType<typeof createTypedRule>["create"]>[0]
>;

/**
 * Determine whether an expression is the `null` literal.
 *
 * @param node - Expression to inspect.
 *
 * @returns `true` when the expression is `null`.
 */
const isNullExpression = (node: Readonly<TSESTree.Expression>): boolean =>
    node.type === "Literal" && node.value === null;

/**
 * Determine whether an expression references the global `undefined` value.
 *
 * @param context - Active rule context for scope resolution.
 * @param node - Expression to inspect.
 *
 * @returns `true` when the expression is an unshadowed `undefined` identifier.
 */
const isUndefinedExpression = ({
    context,
    node,
}: Readonly<{
    context: RuleContext;
    node: Readonly<TSESTree.Expression>;
}>): boolean => {
    if (!(node.type === "Identifier" && node.name === "undefined")) {
        return false;
    }

    return isGlobalUndefinedIdentifier(context, node);
};

/**
 * Check whether an `if` consequent contains only a throw statement.
 *
 * @param node - Consequent statement to inspect.
 *
 * @returns `true` for `throw ...` and `{ throw ... }` shapes.
 */
const isThrowOnlyConsequent = (node: Readonly<TSESTree.Statement>): boolean => {
    if (node.type === "ThrowStatement") {
        return true;
    }

    /* v8 ignore next 4 -- defensive sparse-array guard for malformed synthetic AST nodes. */
    return (
        node.type === "BlockStatement" &&
        node.body.length === 1 &&
        node.body[0]?.type === "ThrowStatement"
    );
};

/**
 * Extract the throw statement from a throw-only consequent.
 *
 * @param node - Consequent statement to inspect.
 *
 * @returns Throw statement when present; otherwise `null`.
 */
const getThrowStatementFromConsequent = (
    node: Readonly<TSESTree.Statement>
): null | TSESTree.ThrowStatement => {
    if (node.type === "ThrowStatement") {
        return node;
    }

    /* v8 ignore next 5 -- defensive sparse-array guard for malformed synthetic AST nodes. */
    if (
        node.type === "BlockStatement" &&
        node.body.length === 1 &&
        node.body[0]?.type === "ThrowStatement"
    ) {
        return node.body[0];
    }

    /* v8 ignore next -- guarded by isThrowOnlyConsequent before this helper is invoked in rule flow. */
    return null;
};

/**
 * Check whether a throw branch matches the canonical `assertPresent`-equivalent
 * TypeError template shape.
 */
const isCanonicalAssertPresentThrow = ({
    context,
    guardExpression,
    throwStatement,
}: Readonly<{
    context: RuleContext;
    guardExpression: TSESTree.Expression;
    throwStatement: TSESTree.ThrowStatement;
}>): boolean => {
    if (
        throwStatement.argument.type !== "NewExpression" ||
        throwStatement.argument.callee.type !== "Identifier" ||
        throwStatement.argument.callee.name !== "TypeError" ||
        !isGlobalIdentifierNamed(
            context,
            throwStatement.argument.callee,
            "TypeError"
        ) ||
        throwStatement.argument.arguments.length !== 1
    ) {
        return false;
    }

    const [firstArgument] = throwStatement.argument.arguments;
    if (
        !firstArgument ||
        firstArgument.type === "SpreadElement" ||
        firstArgument.type !== "TemplateLiteral"
    ) {
        return false;
    }

    const [prefixQuasi, suffixQuasi] = firstArgument.quasis;
    if (
        !prefixQuasi ||
        !suffixQuasi ||
        firstArgument.expressions.length !== 1
    ) {
        return false;
    }

    const [templateExpression] = firstArgument.expressions;
    /* v8 ignore next -- parser guarantees an element at index 0 when expressions.length is exactly 1. */
    if (!templateExpression) {
        return false;
    }

    return (
        (prefixQuasi.value.cooked === "Expected a present value, got `" ||
            prefixQuasi.value.cooked === "Expected a present value, got ") &&
        (suffixQuasi.value.cooked === "`" || suffixQuasi.value.cooked === "") &&
        areEquivalentExpressions(templateExpression, guardExpression)
    );
};

/**
 * Extract the guarded expression from `x == null` / `null == x` checks.
 *
 * @param test - Test expression to inspect.
 *
 * @returns Guarded expression when the check is supported; otherwise `null`.
 */
const extractEqNullGuardExpression = (
    test: Readonly<TSESTree.Expression>
): null | TSESTree.Expression => {
    if (test.type !== "BinaryExpression" || test.operator !== "==") {
        return null;
    }

    if (isNullExpression(test.left)) {
        return test.right;
    }

    if (isNullExpression(test.right)) {
        return test.left;
    }

    return null;
};

/**
 * Extract one nullish-equality comparison part from a binary expression.
 *
 * @param expression - Candidate comparison expression.
 * @param context - Active rule context for global-binding checks.
 *
 * @returns Matched comparison metadata; otherwise `null`.
 */
const extractNullishEqualityPart = (
    expression: Readonly<TSESTree.Expression>,
    context: RuleContext
): null | {
    expression: TSESTree.Expression;
    kind: "null" | "undefined";
} => {
    if (
        expression.type !== "BinaryExpression" ||
        (expression.operator !== "==" && expression.operator !== "===")
    ) {
        return null;
    }

    if (isNullExpression(expression.left)) {
        return {
            expression: expression.right,
            kind: "null",
        };
    }

    if (isNullExpression(expression.right)) {
        return {
            expression: expression.left,
            kind: "null",
        };
    }

    if (
        isUndefinedExpression({
            context,
            node: expression.left,
        })
    ) {
        return {
            expression: expression.right,
            kind: "undefined",
        };
    }

    if (
        isUndefinedExpression({
            context,
            node: expression.right,
        })
    ) {
        return {
            expression: expression.left,
            kind: "undefined",
        };
    }

    return null;
};

/**
 * ESLint rule definition for `prefer-ts-extras-assert-present`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasAssertPresentRule: ReturnType<typeof createTypedRule> =
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

            /**
             * Extracts the guarded expression from supported nullish-present
             * checks used before throwing.
             *
             * @param test - If-statement test expression.
             *
             * @returns Guarded expression when the test matches `x == null` or
             *   split null/undefined disjunction patterns; otherwise `null`.
             */
            const extractPresentGuardExpression = (
                test: Readonly<TSESTree.Expression>
            ): null | TSESTree.Expression => {
                const eqNullExpression = extractEqNullGuardExpression(test);
                if (eqNullExpression) {
                    return eqNullExpression;
                }

                if (
                    test.type !== "LogicalExpression" ||
                    test.operator !== "||"
                ) {
                    return null;
                }

                const leftPart = extractNullishEqualityPart(test.left, context);
                const rightPart = extractNullishEqualityPart(
                    test.right,
                    context
                );

                if (
                    !leftPart ||
                    !rightPart ||
                    leftPart.kind === rightPart.kind
                ) {
                    return null;
                }

                return areEquivalentExpressions(
                    leftPart.expression,
                    rightPart.expression
                )
                    ? leftPart.expression
                    : null;
            };

            return {
                IfStatement(node) {
                    if (
                        node.alternate ||
                        !isThrowOnlyConsequent(node.consequent)
                    ) {
                        return;
                    }

                    const guardExpression = extractPresentGuardExpression(
                        node.test
                    );

                    if (!guardExpression) {
                        return;
                    }

                    const throwStatement = getThrowStatementFromConsequent(
                        node.consequent
                    );
                    const canAutofix =
                        throwStatement !== null &&
                        isCanonicalAssertPresentThrow({
                            context,
                            guardExpression,
                            throwStatement,
                        });

                    const replacementFix =
                        createSafeValueNodeTextReplacementFix({
                            context,
                            dedupeImportInsertionFixes: canAutofix,
                            importedName: "assertPresent",
                            imports: tsExtrasImports,
                            replacementTextFactory: (replacementName) =>
                                `${replacementName}(${context.sourceCode.getText(guardExpression)});`,
                            sourceModuleName: "ts-extras",
                            targetNode: node,
                        });

                    if (replacementFix === null) {
                        context.report({
                            messageId: "preferTsExtrasAssertPresent",
                            node,
                        });

                        return;
                    }

                    if (canAutofix) {
                        context.report({
                            fix: replacementFix,
                            messageId: "preferTsExtrasAssertPresent",
                            node,
                        });

                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasAssertPresent",
                        node,
                        suggest: [
                            {
                                fix: replacementFix,
                                messageId: "suggestTsExtrasAssertPresent",
                            },
                        ],
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras assertPresent over manual nullish-guard throw blocks.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-assert-present",
            },
            fixable: "code",
            hasSuggestions: true,
            messages: {
                preferTsExtrasAssertPresent:
                    "Prefer `assertPresent` from `ts-extras` over manual nullish guard throw blocks.",
                suggestTsExtrasAssertPresent:
                    "Replace this manual guard with `assertPresent(...)` from `ts-extras`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-assert-present",
    });

/**
 * Default export for the `prefer-ts-extras-assert-present` rule module.
 */
export default preferTsExtrasAssertPresentRule;
