import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

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

const extractDefinedGuardExpression = (
    test: TSESTree.Expression
): null | TSESTree.Expression => {
    if (
        test.type !== "BinaryExpression" ||
        (test.operator !== "==" && test.operator !== "===")
    ) {
        return null;
    }

    if (isUndefinedExpression(test.left)) {
        return test.right;
    }

    if (isUndefinedExpression(test.right)) {
        return test.left;
    }

    return null;
};

const preferTsExtrasAssertDefinedRule: ReturnType<typeof createTypedRule> =
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

                    if (!extractDefinedGuardExpression(node.test)) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasAssertDefined",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras assertDefined over manual undefined-guard throw blocks.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-assert-defined.md",
            },
            messages: {
                preferTsExtrasAssertDefined:
                    "Prefer `assertDefined` from `ts-extras` over manual undefined guard throw blocks.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-assert-defined",
    });

export default preferTsExtrasAssertDefinedRule;
