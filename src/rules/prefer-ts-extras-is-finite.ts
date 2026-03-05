import { reportTsExtrasGlobalMemberCall } from "../_internal/global-member-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { RULE_DOCS_URL_BASE } from "../_internal/rule-docs-url.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-finite`.
 */
import { createTypedRule } from "../_internal/typed-rule.js";

const RULE_DOCS_URL = `${RULE_DOCS_URL_BASE}/prefer-ts-extras-is-finite`;

/**
 * ESLint rule definition for `prefer-ts-extras-is-finite`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsFiniteRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            return {
                CallExpression(node) {
                    reportTsExtrasGlobalMemberCall({
                        context,
                        importedName: "isFinite",
                        imports: tsExtrasImports,
                        memberName: "isFinite",
                        messageId: "preferTsExtrasIsFinite",
                        node,
                        objectName: "Number",
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras isFinite over Number.isFinite for consistent predicate helper usage.",
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
            messages: {
                preferTsExtrasIsFinite:
                    "Prefer `isFinite` from `ts-extras` over `Number.isFinite(...)`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-finite",
    });

/**
 * Default export for the `prefer-ts-extras-is-finite` rule module.
 */
export default preferTsExtrasIsFiniteRule;
