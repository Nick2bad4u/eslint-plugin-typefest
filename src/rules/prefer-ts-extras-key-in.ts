/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-key-in`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueNodeTextReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * Narrow a binary operand to an identifier usable by `keyIn`.
 */
const isIdentifierOperand = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>
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
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            /**
             * Build a safe fixer that rewrites `key in object` to
             * `keyIn(object, key)` when both operands are simple identifiers.
             */
            const createKeyInFix = (
                node: Readonly<TSESTree.BinaryExpression>
            ): null | TSESLint.ReportFixFunction => {
                if (
                    !isIdentifierOperand(node.left) ||
                    !isIdentifierOperand(node.right)
                ) {
                    return null;
                }

                const keyText = context.sourceCode.getText(node.left);
                const objectText = context.sourceCode.getText(node.right);

                return createSafeValueNodeTextReplacementFix({
                    context,
                    importedName: "keyIn",
                    imports: tsExtrasImports,
                    replacementTextFactory: (replacementName) =>
                        `${replacementName}(${objectText}, ${keyText})`,
                    sourceModuleName: "ts-extras",
                    targetNode: node,
                });
            };

            return {
                BinaryExpression(node) {
                    if (node.operator !== "in") {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: createKeyInFix(node),
                        messageId: "preferTsExtrasKeyIn",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras keyIn over `in` key checks for stronger narrowing.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-key-in",
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
