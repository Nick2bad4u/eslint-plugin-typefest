/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-find-last`.
 */
import { createIsArrayLikeExpressionChecker } from "../_internal/array-like-expression.js";
import {
    collectDirectNamedValueImportsFromSource,
    createMethodToFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-array-find-last`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayFindLastRule: ReturnType<typeof createTypedRule> =
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
                    if (
                        node.callee.type !== "MemberExpression" ||
                        node.callee.computed
                    ) {
                        return;
                    }

                    if (
                        node.callee.property.type !== "Identifier" ||
                        node.callee.property.name !== "findLast"
                    ) {
                        return;
                    }

                    if (!isArrayLikeExpression(node.callee.object)) {
                        return;
                    }

                    context.report({
                        fix: createMethodToFunctionCallFix({
                            callNode: node,
                            context,
                            importedName: "arrayFindLast",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                        }),
                        messageId: "preferTsExtrasArrayFindLast",
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
                    "require ts-extras arrayFindLast over Array#findLast for stronger predicate inference.",
                frozen: false,
                recommended: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-find-last",
            },
            fixable: "code",
            messages: {
                preferTsExtrasArrayFindLast:
                    "Prefer `arrayFindLast` from `ts-extras` over `array.findLast(...)` for stronger predicate inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-find-last",
    });

/**
 * Default export for the `prefer-ts-extras-array-find-last` rule module.
 */
export default preferTsExtrasArrayFindLastRule;
