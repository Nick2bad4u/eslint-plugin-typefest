/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-assert-defined`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    getSafeLocalNameForImportedValue,
} from "../_internal/imported-value-symbols.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * Check whether the input is undefined expression.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is undefined expression; otherwise `false`.
 */

const isUndefinedExpression = (node: TSESTree.Expression): boolean =>
    node.type === "Identifier" && node.name === "undefined";

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

const getThrowStatementFromConsequent = (
    node: TSESTree.Statement
): null | TSESTree.ThrowStatement => {
    if (node.type === "ThrowStatement") {
        return node;
    }

    if (
        node.type === "BlockStatement" &&
        node.body.length === 1 &&
        node.body[0]?.type === "ThrowStatement"
    ) {
        return node.body[0];
    }

    return null;
};

const isCanonicalAssertDefinedThrow = (
    throwStatement: TSESTree.ThrowStatement
): boolean => {
    if (
        throwStatement.argument.type !== "NewExpression" ||
        throwStatement.argument.callee.type !== "Identifier" ||
        throwStatement.argument.callee.name !== "TypeError" ||
        throwStatement.argument.arguments.length !== 1
    ) {
        return false;
    }

    const [firstArgument] = throwStatement.argument.arguments;
    if (!firstArgument || firstArgument.type === "SpreadElement") {
        return false;
    }

    return (
        firstArgument.type === "Literal" &&
        firstArgument.value === "Expected a defined value, got `undefined`"
    );
};

/**
 * ExtractDefinedGuardExpression helper.
 *
 * @param test - Value to inspect.
 *
 * @returns ExtractDefinedGuardExpression helper result.
 */

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

/**
 * ESLint rule definition for `prefer-ts-extras-assert-defined`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasAssertDefinedRule: ReturnType<typeof createTypedRule> =
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

                    const guardExpression = extractDefinedGuardExpression(
                        node.test
                    );

                    if (!guardExpression) {
                        return;
                    }

                    const replacementName = getSafeLocalNameForImportedValue({
                        context,
                        importedName: "assertDefined",
                        imports: tsExtrasImports,
                        referenceNode: node,
                        sourceModuleName: "ts-extras",
                    });

                    if (!replacementName) {
                        context.report({
                            messageId: "preferTsExtrasAssertDefined",
                            node,
                        });

                        return;
                    }

                    const replacementText = `${replacementName}(${context.sourceCode.getText(guardExpression)});`;

                    const throwStatement = getThrowStatementFromConsequent(
                        node.consequent
                    );
                    const canAutofix =
                        throwStatement !== null &&
                        isCanonicalAssertDefinedThrow(throwStatement);

                    if (canAutofix) {
                        context.report({
                            fix: (fixer) =>
                                fixer.replaceText(node, replacementText),
                            messageId: "preferTsExtrasAssertDefined",
                            node,
                        });

                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasAssertDefined",
                        node,
                        suggest: [
                            {
                                fix: (fixer) =>
                                    fixer.replaceText(node, replacementText),
                                messageId: "suggestTsExtrasAssertDefined",
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
                    "require ts-extras assertDefined over manual undefined-guard throw blocks.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-assert-defined.md",
            },
            fixable: "code",
            hasSuggestions: true,
            messages: {
                preferTsExtrasAssertDefined:
                    "Prefer `assertDefined` from `ts-extras` over manual undefined guard throw blocks.",
                suggestTsExtrasAssertDefined:
                    "Replace this manual guard with `assertDefined(...)` from `ts-extras`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-assert-defined",
    });

/**
 * Default export for the `prefer-ts-extras-assert-defined` rule module.
 */
export default preferTsExtrasAssertDefinedRule;
