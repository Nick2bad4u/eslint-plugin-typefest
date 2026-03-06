/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-has-in`.
 */
import { reportTsExtrasGlobalMemberCall } from "../_internal/global-member-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { RULE_DOCS_URL_BASE } from "../_internal/rule-docs-url.js";
import { isTypePredicateExpressionAutofixSafe } from "../_internal/type-predicate-autofix-safety.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const RULE_DOCS_URL = `${RULE_DOCS_URL_BASE}/prefer-ts-extras-object-has-in`;

/**
 * ESLint rule definition for `prefer-ts-extras-object-has-in`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasObjectHasInRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            return {
                CallExpression(node) {
                    if (node.arguments.length < 2) {
                        return;
                    }

                    reportTsExtrasGlobalMemberCall({
                        canAutofix: isTypePredicateExpressionAutofixSafe,
                        context,
                        importedName: "objectHasIn",
                        imports: tsExtrasImports,
                        memberName: "has",
                        messageId: "preferTsExtrasObjectHasIn",
                        node,
                        objectName: "Reflect",
                        reportSuggestion: ({ fix, node: suggestionNode }) => {
                            context.report({
                                messageId: "preferTsExtrasObjectHasIn",
                                node: suggestionNode,
                                suggest: [
                                    {
                                        fix,
                                        messageId: "suggestTsExtrasObjectHasIn",
                                    },
                                ],
                            });
                        },
                        suggestionMessageId: "suggestTsExtrasObjectHasIn",
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras objectHasIn over Reflect.has for stronger key-in-object narrowing.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: RULE_DOCS_URL,
            },
            fixable: "code",
            hasSuggestions: true,
            messages: {
                preferTsExtrasObjectHasIn:
                    "Prefer `objectHasIn` from `ts-extras` over `Reflect.has` for better type narrowing.",
                suggestTsExtrasObjectHasIn:
                    "Replace this `Reflect.has(...)` call with `objectHasIn(...)` from `ts-extras`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-has-in",
    });

/**
 * Default export for the `prefer-ts-extras-object-has-in` rule module.
 */
export default preferTsExtrasObjectHasInRule;
