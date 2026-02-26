/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-find-last-index`.
 */
import { createIsArrayLikeExpressionChecker } from "../_internal/array-like-expression.js";
import {
    collectDirectNamedValueImportsFromSource,
    createMethodToFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
} from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-array-find-last-index`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayFindLastIndexRule: ReturnType<typeof createTypedRule> =
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
                        node.callee.property.name !== "findLastIndex"
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
                            importedName: "arrayFindLastIndex",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                        }),
                        messageId: "preferTsExtrasArrayFindLastIndex",
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
                    "require ts-extras arrayFindLastIndex over Array#findLastIndex for stronger predicate inference.",
                frozen: false,
                recommended: "typefest.configs.all",
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-find-last-index",
            },
            fixable: "code",
            messages: {
                preferTsExtrasArrayFindLastIndex:
                    "Prefer `arrayFindLastIndex` from `ts-extras` over `array.findLastIndex(...)` for stronger predicate inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-find-last-index",
    });

/**
 * Default export for the `prefer-ts-extras-array-find-last-index` rule module.
 */
export default preferTsExtrasArrayFindLastIndexRule;
