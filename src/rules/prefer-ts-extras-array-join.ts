/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-join`.
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
 * ESLint rule definition for `prefer-ts-extras-array-join`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayJoinRule: ReturnType<typeof createTypedRule> =
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
                    const arrayJoinCall = getIdentifierPropertyMemberCall({
                        memberName: "join",
                        node,
                    });

                    if (arrayJoinCall === null) {
                        return;
                    }

                    if (!isArrayLikeExpression(arrayJoinCall.callee.object)) {
                        return;
                    }

                    context.report({
                        fix: createMethodToFunctionCallFix({
                            callNode: node,
                            context,
                            importedName: "arrayJoin",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                        }),
                        messageId: "preferTsExtrasArrayJoin",
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
                    "require ts-extras arrayJoin over Array#join for stronger tuple-aware typing.",
                frozen: false,
                recommended: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-join",
            },
            fixable: "code",
            messages: {
                preferTsExtrasArrayJoin:
                    "Prefer `arrayJoin` from `ts-extras` over `array.join(...)` for stronger tuple-aware typing.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-join",
    });

/**
 * Default export for the `prefer-ts-extras-array-join` rule module.
 */
export default preferTsExtrasArrayJoinRule;
