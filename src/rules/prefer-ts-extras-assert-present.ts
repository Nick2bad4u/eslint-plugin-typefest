import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const isNullExpression = (node: TSESTree.Expression): boolean =>
    node.type === "Literal" && node.value === null;

const isUndefinedExpression = (node: TSESTree.Expression): boolean =>
    node.type === "Identifier" && node.name === "undefined";

const isThrowOnlyConsequent = (node: TSESTree.Statement): boolean => {
    if (node.type === "ThrowStatement") {
        return true;
    }

    return (
        node.type === "BlockStatement" &&
        node.body.length === 1 &&
        node.body[0]?.type === "ThrowStatement"
    );
};

const extractEqNullGuardExpression = (
    test: TSESTree.Expression
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

const extractNullishEqualityPart = (
    expression: TSESTree.Expression
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

    if (isUndefinedExpression(expression.left)) {
        return {
            expression: expression.right,
            kind: "undefined",
        };
    }

    if (isUndefinedExpression(expression.right)) {
        return {
            expression: expression.left,
            kind: "undefined",
        };
    }

    return null;
};

const preferTsExtrasAssertPresentRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            const { sourceCode } = context;

            const extractPresentGuardExpression = (
                test: TSESTree.Expression
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

                const leftPart = extractNullishEqualityPart(test.left);
                const rightPart = extractNullishEqualityPart(test.right);

                if (
                    !leftPart ||
                    !rightPart ||
                    leftPart.kind === rightPart.kind
                ) {
                    return null;
                }

                return sourceCode.getText(leftPart.expression) ===
                    sourceCode.getText(rightPart.expression)
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

                    if (!extractPresentGuardExpression(node.test)) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasAssertPresent",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras assertPresent over manual nullish-guard throw blocks.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-assert-present.md",
            },
            messages: {
                preferTsExtrasAssertPresent:
                    "Prefer `assertPresent` from `ts-extras` over manual nullish guard throw blocks.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-assert-present",
    });

export default preferTsExtrasAssertPresentRule;
