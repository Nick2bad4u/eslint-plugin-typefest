/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-first`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    createIsArrayLikeExpressionChecker,
    isWriteTargetMemberExpression,
} from "../_internal/array-like-expression.js";
import {
    collectDirectNamedValueImportsFromSource,
    createMemberToFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";

/**
 * Checks whether a computed member property represents index `0`.
 *
 * @param node - Member property node candidate.
 *
 * @returns `true` for numeric `0` and string literal `"0"` property nodes.
 */

const isZeroProperty = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>
): boolean =>
    node.type === "Literal" && (node.value === 0 || node.value === "0");

/**
 * ESLint rule definition for `prefer-ts-extras-array-first`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayFirstRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            const { checker, parserServices } = getTypedRuleServices(context);
            const isArrayLikeExpression = createIsArrayLikeExpressionChecker({
                checker,
                parserServices,
            });

            return {
                MemberExpression(node) {
                    if (!node.computed || !isZeroProperty(node.property)) {
                        return;
                    }

                    if (isWriteTargetMemberExpression(node)) {
                        return;
                    }

                    if (!isArrayLikeExpression(node.object)) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: createMemberToFunctionCallFix({
                            context,
                            importedName: "arrayFirst",
                            imports: tsExtrasImports,
                            memberNode: node,
                            sourceModuleName: "ts-extras",
                        }),
                        messageId: "preferTsExtrasArrayFirst",
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
                    "require ts-extras arrayFirst over direct [0] array access for stronger tuple and readonly-array inference.",
                frozen: false,
                recommended: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-first",
            },
            fixable: "code",
            messages: {
                preferTsExtrasArrayFirst:
                    "Prefer `arrayFirst` from `ts-extras` over direct `array[0]` access for stronger inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-first",
    });

/**
 * Default export for the `prefer-ts-extras-array-first` rule module.
 */
export default preferTsExtrasArrayFirstRule;
