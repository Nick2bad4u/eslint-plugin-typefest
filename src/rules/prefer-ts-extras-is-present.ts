/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-present`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const FILTER_METHOD_NAME = "filter";

type NodeWithParent = TSESTree.Node & {
    parent?: TSESTree.Node;
};

type NullishComparison = {
    readonly comparedExpression: TSESTree.Expression;
    readonly kind: NullishKind;
    readonly operator: "!=" | "!==" | "==" | "===";
};

type NullishKind = "null" | "undefined";

const flattenLogicalTerms = ({
    expression,
    operator,
}: {
    expression: TSESTree.Expression;
    operator: "&&" | "||";
}): readonly TSESTree.Expression[] => {
    if (
        expression.type !== "LogicalExpression" ||
        expression.operator !== operator
    ) {
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

const isUndefinedIdentifier = (expression: TSESTree.Expression): boolean =>
    expression.type === "Identifier" && expression.name === "undefined";

const getNullishComparison = (
    expression: TSESTree.Expression
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

    if (isUndefinedIdentifier(expression.right)) {
        return {
            comparedExpression: expression.left,
            kind: "undefined",
            operator: expression.operator,
        };
    }

    if (isUndefinedIdentifier(expression.left)) {
        return {
            comparedExpression: expression.right,
            kind: "undefined",
            operator: expression.operator,
        };
    }

    return null;
};

const isFilterCall = (
    expression: TSESTree.CallExpression
): expression is TSESTree.CallExpression & {
    callee: TSESTree.MemberExpression & {
        computed: false;
        property: TSESTree.Identifier;
    };
} =>
    expression.callee.type === "MemberExpression" &&
    !expression.callee.computed &&
    expression.callee.property.type === "Identifier" &&
    expression.callee.property.name === FILTER_METHOD_NAME;

const isFunctionCallbackNode = (
    node: TSESTree.Node
): node is TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression =>
    node.type === "ArrowFunctionExpression" ||
    node.type === "FunctionExpression";

const getParentNode = (node: TSESTree.Node): TSESTree.Node | undefined =>
    (node as NodeWithParent).parent;

const isWithinFilterCallback = ({ node }: { node: TSESTree.Node }): boolean => {
    let currentNode: TSESTree.Node | undefined = node;

    while (currentNode) {
        if (isFunctionCallbackNode(currentNode)) {
            const callbackParent = getParentNode(currentNode);

            if (
                callbackParent?.type === "CallExpression" &&
                callbackParent.arguments.includes(currentNode) &&
                isFilterCall(callbackParent)
            ) {
                return true;
            }
        }

        currentNode = getParentNode(currentNode);
    }

    return false;
};

const haveSameComparedExpression = ({
    first,
    second,
    sourceCode,
}: {
    first: TSESTree.Expression;
    second: TSESTree.Expression;
    sourceCode: Readonly<TSESLint.SourceCode>;
}): boolean =>
    sourceCode.getText(first).trim() === sourceCode.getText(second).trim();

const isStrictPresentCheck = ({
    node,
    sourceCode,
}: {
    node: TSESTree.LogicalExpression;
    sourceCode: Readonly<TSESLint.SourceCode>;
}): boolean => {
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

    const [firstTerm, secondTerm] = terms;

    if (!firstTerm || !secondTerm) {
        return false;
    }

    const first = getNullishComparison(firstTerm);
    const second = getNullishComparison(secondTerm);

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
        sourceCode,
    });
};

const isStrictAbsentCheck = ({
    node,
    sourceCode,
}: {
    node: TSESTree.LogicalExpression;
    sourceCode: Readonly<TSESLint.SourceCode>;
}): boolean => {
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

    const [firstTerm, secondTerm] = terms;

    if (!firstTerm || !secondTerm) {
        return false;
    }

    const first = getNullishComparison(firstTerm);
    const second = getNullishComparison(secondTerm);

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
        sourceCode,
    });
};

const preferTsExtrasIsPresentRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                BinaryExpression(node) {
                    if (
                        isWithinFilterCallback({
                            node,
                        })
                    ) {
                        return;
                    }

                    const comparison = getNullishComparison(node);
                    if (comparison?.kind !== "null") {
                        return;
                    }

                    if (comparison.operator === "!=") {
                        context.report({
                            messageId: "preferTsExtrasIsPresent",
                            node,
                        });
                    }

                    if (comparison.operator === "==") {
                        context.report({
                            messageId: "preferTsExtrasIsPresentNegated",
                            node,
                        });
                    }
                },
                LogicalExpression(node) {
                    if (
                        isWithinFilterCallback({
                            node,
                        })
                    ) {
                        return;
                    }

                    if (
                        isStrictPresentCheck({
                            node,
                            sourceCode: context.sourceCode,
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
                            node,
                            sourceCode: context.sourceCode,
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
            docs: {
                description:
                    "require ts-extras isPresent over inline nullish comparisons outside filter callbacks.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-present.md",
            },
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

export default preferTsExtrasIsPresentRule;
