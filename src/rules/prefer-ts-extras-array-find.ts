/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-find`.
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
 * ESLint rule definition for `prefer-ts-extras-array-find`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayFindRule: ReturnType<typeof createTypedRule> =
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
                        node.callee.property.name !== "find"
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
                            importedName: "arrayFind",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                        }),
                        messageId: "preferTsExtrasArrayFind",
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
                    "require ts-extras arrayFind over Array#find for stronger predicate inference.",
                frozen: false,
                recommended: "typefest.configs.all",
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-find",
            },
            fixable: "code",
            messages: {
                preferTsExtrasArrayFind:
                    "Prefer `arrayFind` from `ts-extras` over `array.find(...)` for stronger predicate inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-find",
    });

/**
 * Default export for the `prefer-ts-extras-array-find` rule module.
 */
export default preferTsExtrasArrayFindRule;
