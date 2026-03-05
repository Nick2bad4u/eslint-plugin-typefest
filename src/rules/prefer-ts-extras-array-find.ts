/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-find`.
 */
import { createIsArrayLikeExpressionChecker } from "../_internal/array-like-expression.js";
import { reportTsExtrasArrayMethodCall } from "../_internal/array-method-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { RULE_DOCS_URL_BASE } from "../_internal/rule-docs-url.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";

const RULE_DOCS_URL = `${RULE_DOCS_URL_BASE}/prefer-ts-extras-array-find`;

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
                    reportTsExtrasArrayMethodCall({
                        context,
                        importedName: "arrayFind",
                        imports: tsExtrasImports,
                        isArrayLikeExpression,
                        memberName: "find",
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
                url: RULE_DOCS_URL,
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
