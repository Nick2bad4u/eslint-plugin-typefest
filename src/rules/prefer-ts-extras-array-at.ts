/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-at`.
 */
import { createIsArrayLikeExpressionChecker } from "../_internal/array-like-expression.js";
import { reportTsExtrasArrayMethodCall } from "../_internal/array-method-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-array-at`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayAtRule: ReturnType<typeof createTypedRule> =
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
                CallExpression(node) {
                    reportTsExtrasArrayMethodCall({
                        context,
                        importedName: "arrayAt",
                        imports: tsExtrasImports,
                        isArrayLikeExpression,
                        memberName: "at",
                        messageId: "preferTsExtrasArrayAt",
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
                    "require ts-extras arrayAt over Array#at for stronger element inference.",
                frozen: false,
                recommended: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-at",
            },
            fixable: "code",
            messages: {
                preferTsExtrasArrayAt:
                    "Prefer `arrayAt` from `ts-extras` over `array.at(...)` for stronger element inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-at",
    });

/**
 * Default export for the `prefer-ts-extras-array-at` rule module.
 */
export default preferTsExtrasArrayAtRule;
