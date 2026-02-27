/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-assert-error`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueNodeTextReplacementFix,
} from "../_internal/imported-value-symbols.js";
import {
    createTypedRule,
    isGlobalIdentifierNamed,
    isTestFilePath,
} from "../_internal/typed-rule.js";

/**
 * Check whether the input is throw only consequent.
 *
 * @param context - Rule context used for global identifier resolution.
 * @param expression - Value to inspect.
 *
 * @returns `true` when the value is throw only consequent; otherwise `false`.
 */

const isThrowOnlyConsequent = (node: Readonly<TSESTree.Statement>): boolean => {
    if (node.type === "ThrowStatement") {
        return true;
    }

    if (node.type !== "BlockStatement") {
        return false;
    }

    if (node.body.length !== 1) {
        return false;
    }

    return node.body[0]?.type === "ThrowStatement";
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
    context: Readonly<TSESLint.RuleContext<string, Readonly<UnknownArray>>>,
    expression: Readonly<TSESTree.Expression>
): expression is TSESTree.BinaryExpression => {
    if (expression.type !== "BinaryExpression") {
        return false;
    }

    if (expression.operator !== "instanceof") {
        return false;
    }

    if (expression.right.type !== "Identifier") {
        return false;
    }

    return isGlobalIdentifierNamed(context, expression.right, "Error");
};

/**
 * ExtractAssertErrorTarget helper.
 *
 * @param context - Rule context used for global identifier resolution.
 * @param test - Value to inspect.
 *
 * @returns ExtractAssertErrorTarget helper result.
 */

const extractAssertErrorTarget = (
    context: Readonly<TSESLint.RuleContext<string, Readonly<UnknownArray>>>,
    test: Readonly<TSESTree.Expression>
): null | TSESTree.Expression => {
    if (test.type !== "UnaryExpression") {
        return null;
    }

    if (test.operator !== "!") {
        return null;
    }

    const { argument } = test;

    if (!isErrorInstanceofExpression(context, argument)) {
        return null;
    }

    /* V8 ignore next -- ESTree allows PrivateIdentifier here, but parsed
       TS/JS `instanceof` left operands are expressions (e.g. `this.#value`),
       not bare PrivateIdentifier nodes. */
    if (argument.left.type === "PrivateIdentifier") {
        return null;
    }

    return argument.left;
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
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            return {
                IfStatement(node) {
                    if (
                        node.alternate ||
                        !isThrowOnlyConsequent(node.consequent)
                    ) {
                        return;
                    }

                    const guardExpression = extractAssertErrorTarget(
                        context,
                        node.test
                    );

                    if (!guardExpression) {
                        return;
                    }

                    const replacementFix =
                        createSafeValueNodeTextReplacementFix({
                            context,
                            importedName: "assertError",
                            imports: tsExtrasImports,
                            replacementTextFactory: (replacementName) =>
                                `${replacementName}(${context.sourceCode.getText(guardExpression)});`,
                            sourceModuleName: "ts-extras",
                            targetNode: node,
                        });

                    if (replacementFix === null) {
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
                                fix: replacementFix,
                                messageId: "suggestTsExtrasAssertError",
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
                    "require ts-extras assertError over manual instanceof Error throw guards.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-assert-error",
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
