/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-infinite`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueArgumentFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

type InfinityComparison = Readonly<{
    comparedExpression: TSESTree.Expression;
    kind: InfinityKind;
    operator: "==" | "===";
}>;

type InfinityKind = "negative" | "positive";

/**
 * Check whether the input is infinity reference.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is infinity reference; otherwise `false`.
 */

const isInfinityReference = (node: TSESTree.Expression): boolean => {
    if (node.type === "Identifier" && node.name === "Infinity") {
        return true;
    }

    return (
        node.type === "MemberExpression" &&
        !node.computed &&
        node.object.type === "Identifier" &&
        node.object.name === "Number" &&
        node.property.type === "Identifier" &&
        (node.property.name === "POSITIVE_INFINITY" ||
            node.property.name === "NEGATIVE_INFINITY")
    );
};

/**
 * ExtractInfinityKind helper.
 *
 * @param node - Value to inspect.
 *
 * @returns ExtractInfinityKind helper result.
 */
const extractInfinityKind = (
    node: TSESTree.Expression
): InfinityKind | null => {
    if (node.type === "Identifier" && node.name === "Infinity") {
        return "positive";
    }

    if (
        node.type !== "MemberExpression" ||
        node.computed ||
        node.object.type !== "Identifier" ||
        node.object.name !== "Number" ||
        node.property.type !== "Identifier"
    ) {
        return null;
    }

    if (node.property.name === "POSITIVE_INFINITY") {
        return "positive";
    }

    if (node.property.name === "NEGATIVE_INFINITY") {
        return "negative";
    }

    return null;
};

/**
 * ExtractInfinityComparison helper.
 *
 * @param expression - Value to inspect.
 *
 * @returns ExtractInfinityComparison helper result.
 */
const extractInfinityComparison = (
    expression: TSESTree.Expression
): InfinityComparison | null => {
    if (
        expression.type !== "BinaryExpression" ||
        (expression.operator !== "==" && expression.operator !== "===")
    ) {
        return null;
    }

    const leftKind = extractInfinityKind(expression.left);
    const rightKind = extractInfinityKind(expression.right);

    if (leftKind && !rightKind) {
        return {
            comparedExpression: expression.right,
            kind: leftKind,
            operator: expression.operator,
        };
    }

    if (!leftKind && rightKind) {
        return {
            comparedExpression: expression.left,
            kind: rightKind,
            operator: expression.operator,
        };
    }

    return null;
};

/**
 * ExtractSafeInfinityDisjunctionTarget helper.
 *
 * @param node - Value to inspect.
 * @param sourceCode - Value to inspect.
 *
 * @returns ExtractSafeInfinityDisjunctionTarget helper result.
 */
const extractSafeInfinityDisjunctionTarget = (
    node: TSESTree.LogicalExpression,
    sourceCode: Readonly<TSESLint.SourceCode>
): null | TSESTree.Expression => {
    if (node.operator !== "||") {
        return null;
    }

    const left = extractInfinityComparison(node.left);
    const right = extractInfinityComparison(node.right);

    if (!left || !right) {
        return null;
    }

    if (left.operator !== "===" || right.operator !== "===") {
        return null;
    }

    if (left.kind === right.kind) {
        return null;
    }

    return sourceCode.getText(left.comparedExpression).trim() ===
        sourceCode.getText(right.comparedExpression).trim()
        ? left.comparedExpression
        : null;
};

/**
 * ESLint rule definition for `prefer-ts-extras-is-infinite`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsInfiniteRule: ReturnType<typeof createTypedRule> =
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
                    const parent = node.parent;
                    if (
                        parent?.type === "LogicalExpression" &&
                        extractSafeInfinityDisjunctionTarget(
                            parent,
                            context.sourceCode
                        )
                    ) {
                        return;
                    }

                    if (node.operator !== "==" && node.operator !== "===") {
                        return;
                    }

                    if (
                        !isInfinityReference(node.left) &&
                        !isInfinityReference(node.right)
                    ) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasIsInfinite",
                        node,
                    });
                },
                LogicalExpression(node) {
                    const comparedExpression =
                        extractSafeInfinityDisjunctionTarget(
                            node,
                            context.sourceCode
                        );

                    if (!comparedExpression) {
                        return;
                    }

                    context.report({
                        fix: createSafeValueArgumentFunctionCallFix({
                            argumentNode: comparedExpression,
                            context,
                            importedName: "isInfinite",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                            targetNode: node,
                        }),
                        messageId: "preferTsExtrasIsInfinite",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras isInfinite over direct Infinity equality checks for consistent predicate helper usage.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-infinite.md",
            },
            fixable: "code",
            messages: {
                preferTsExtrasIsInfinite:
                    "Prefer `isInfinite` from `ts-extras` over direct Infinity equality checks.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-infinite",
    });

/**
 * Default export for the `prefer-ts-extras-is-infinite` rule module.
 */
export default preferTsExtrasIsInfiniteRule;
