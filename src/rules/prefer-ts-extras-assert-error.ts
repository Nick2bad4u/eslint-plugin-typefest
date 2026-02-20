/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-assert-error`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    getSafeLocalNameForImportedValue,
} from "../_internal/imported-value-symbols.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * Check whether the input is throw only consequent.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is throw only consequent; otherwise `false`.
 */

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

/**
 * Check whether the input is error instanceof expression.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is error instanceof expression; otherwise
 *   `false`.
 */

const isErrorInstanceofExpression = (
    node: TSESTree.Expression
): node is TSESTree.BinaryExpression =>
    node.type === "BinaryExpression" &&
    node.operator === "instanceof" &&
    node.right.type === "Identifier" &&
    node.right.name === "Error";

/**
 * ExtractAssertErrorTarget helper.
 *
 * @param test - Value to inspect.
 *
 * @returns ExtractAssertErrorTarget helper result.
 */

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

/**
 * ESLint rule definition for `prefer-ts-extras-assert-error`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasAssertErrorRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

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

                    const guardExpression = extractAssertErrorTarget(node.test);

                    if (!guardExpression) {
                        return;
                    }

                    const replacementName = getSafeLocalNameForImportedValue({
                        context,
                        importedName: "assertError",
                        imports: tsExtrasImports,
                        referenceNode: node,
                        sourceModuleName: "ts-extras",
                    });

                    if (!replacementName) {
                        context.report({
                            messageId: "preferTsExtrasAssertError",
                            node,
                        });

                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasAssertError",
                        node,
                        suggest: [
                            {
                                fix: (fixer) =>
                                    fixer.replaceText(
                                        node,
                                        `${replacementName}(${context.sourceCode.getText(guardExpression)});`
                                    ),
                                messageId: "suggestTsExtrasAssertError",
                            },
                        ],
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
            hasSuggestions: true,
            messages: {
                preferTsExtrasAssertError:
                    "Prefer `assertError` from `ts-extras` over manual `instanceof Error` throw guards.",
                suggestTsExtrasAssertError:
                    "Replace this manual guard with `assertError(...)` from `ts-extras`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-assert-error",
    });

/**
 * Default export for the `prefer-ts-extras-assert-error` rule module.
 */
export default preferTsExtrasAssertErrorRule;
