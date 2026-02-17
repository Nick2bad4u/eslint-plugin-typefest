import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

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

const isErrorInstanceofExpression = (
    node: TSESTree.Expression
): node is TSESTree.BinaryExpression =>
    node.type === "BinaryExpression" &&
    node.operator === "instanceof" &&
    node.right.type === "Identifier" &&
    node.right.name === "Error";

const extractAssertErrorTarget = (
    test: TSESTree.Expression
): null | TSESTree.Expression => {
    if (
        test.type !== "UnaryExpression" ||
        test.operator !== "!" ||
        !isErrorInstanceofExpression(test.argument)
    ) {
        return null;
    }

    return test.argument.left.type === "PrivateIdentifier"
        ? null
        : test.argument.left;
};

const preferTsExtrasAssertErrorRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                IfStatement(node) {
                    if (
                        node.alternate ||
                        !isThrowOnlyConsequent(node.consequent)
                    ) {
                        return;
                    }

                    if (!extractAssertErrorTarget(node.test)) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasAssertError",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras assertError over manual instanceof Error throw guards.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-assert-error.md",
            },
            messages: {
                preferTsExtrasAssertError:
                    "Prefer `assertError` from `ts-extras` over manual `instanceof Error` throw guards.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-assert-error",
    });

export default preferTsExtrasAssertErrorRule;
