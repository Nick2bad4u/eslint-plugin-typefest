import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    getSafeLocalNameForImportedValue,
} from "../_internal/imported-value-symbols.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-key-in`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const isIdentifierOperand = (
    node: TSESTree.Expression | TSESTree.PrivateIdentifier
): node is TSESTree.Identifier => node.type === "Identifier";

/**
 * ESLint rule definition for `prefer-ts-extras-key-in`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasKeyInRule: ReturnType<typeof createTypedRule> =
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

            const createKeyInFix = (
                node: TSESTree.BinaryExpression
            ): null | TSESLint.ReportFixFunction => {
                if (
                    !isIdentifierOperand(node.left) ||
                    !isIdentifierOperand(node.right)
                ) {
                    return null;
                }

                const replacementName = getSafeLocalNameForImportedValue({
                    context,
                    importedName: "keyIn",
                    imports: tsExtrasImports,
                    referenceNode: node,
                    sourceModuleName: "ts-extras",
                });

                if (!replacementName) {
                    return null;
                }

                const keyText = context.sourceCode.getText(node.left);
                const objectText = context.sourceCode.getText(node.right);

                return (fixer) =>
                    fixer.replaceText(
                        node,
                        `${replacementName}(${objectText}, ${keyText})`
                    );
            };

            return {
                BinaryExpression(node) {
                    if (node.operator !== "in") {
                        return;
                    }

                    context.report({
                        fix: createKeyInFix(node),
                        messageId: "preferTsExtrasKeyIn",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras keyIn over `in` key checks for stronger narrowing.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-key-in.md",
            },
            fixable: "code",
            messages: {
                preferTsExtrasKeyIn:
                    "Prefer `keyIn` from `ts-extras` over `key in object` checks for stronger narrowing.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-key-in",
    });

/**
 * Default export for the `prefer-ts-extras-key-in` rule module.
 */
export default preferTsExtrasKeyInRule;
