/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-includes`.
 */
import { createIsArrayLikeExpressionChecker } from "../_internal/array-like-expression.js";
import {
    collectDirectNamedValueImportsFromSource,
    createMethodToFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import { getIdentifierPropertyMemberCall } from "../_internal/member-call.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-array-includes`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayIncludesRule: ReturnType<typeof createTypedRule> =
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
                    const arrayIncludesCall = getIdentifierPropertyMemberCall({
                        memberName: "includes",
                        node,
                    });

                    if (arrayIncludesCall === null) {
                        return;
                    }

                    if (
                        !isArrayLikeExpression(arrayIncludesCall.callee.object)
                    ) {
                        return;
                    }

                    context.report({
                        fix: createMethodToFunctionCallFix({
                            callNode: node,
                            context,
                            importedName: "arrayIncludes",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                        }),
                        messageId: "preferTsExtrasArrayIncludes",
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
                    "require ts-extras arrayIncludes over Array#includes for stronger element inference.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-includes",
            },
            fixable: "code",
            messages: {
                preferTsExtrasArrayIncludes:
                    "Prefer `arrayIncludes` from `ts-extras` over `array.includes(...)` for stronger element inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-includes",
    });

/**
 * Default export for the `prefer-ts-extras-array-includes` rule module.
 */
export default preferTsExtrasArrayIncludesRule;
