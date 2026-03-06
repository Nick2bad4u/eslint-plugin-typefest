import { reportTsExtrasGlobalMemberCall } from "../_internal/global-member-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { RULE_DOCS_URL_BASE } from "../_internal/rule-docs-url.js";
import { isTypePredicateExpressionAutofixSafe } from "../_internal/type-predicate-autofix-safety.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-has-own`.
 */
import { createTypedRule } from "../_internal/typed-rule.js";

const RULE_DOCS_URL = `${RULE_DOCS_URL_BASE}/prefer-ts-extras-object-has-own`;

/**
 * ESLint rule definition for `prefer-ts-extras-object-has-own`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasObjectHasOwnRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            return {
                CallExpression(node) {
                    reportTsExtrasGlobalMemberCall({
                        canAutofix: isTypePredicateExpressionAutofixSafe,
                        context,
                        importedName: "objectHasOwn",
                        imports: tsExtrasImports,
                        memberName: "hasOwn",
                        messageId: "preferTsExtrasObjectHasOwn",
                        node,
                        objectName: "Object",
                        reportSuggestion: ({ fix, node: suggestionNode }) => {
                            context.report({
                                messageId: "preferTsExtrasObjectHasOwn",
                                node: suggestionNode,
                                suggest: [
                                    {
                                        fix,
                                        messageId:
                                            "suggestTsExtrasObjectHasOwn",
                                    },
                                ],
                            });
                        },
                        suggestionMessageId: "suggestTsExtrasObjectHasOwn",
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras objectHasOwn over Object.hasOwn for own-property checks that should also narrow object types.",
                frozen: false,
                recommended: true,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: RULE_DOCS_URL,
            },
            fixable: "code",
            hasSuggestions: true,
            messages: {
                preferTsExtrasObjectHasOwn:
                    "Prefer `objectHasOwn` from `ts-extras` over `Object.hasOwn` for own-property guards with stronger type narrowing.",
                suggestTsExtrasObjectHasOwn:
                    "Replace this `Object.hasOwn(...)` call with `objectHasOwn(...)` from `ts-extras`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-has-own",
    });

/**
 * Default export for the `prefer-ts-extras-object-has-own` rule module.
 */
export default preferTsExtrasObjectHasOwnRule;
