import { reportTsExtrasGlobalMemberCall } from "../_internal/global-member-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { RULE_DOCS_URL_BASE } from "../_internal/rule-docs-url.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-safe-integer`.
 */
import { createTypedRule } from "../_internal/typed-rule.js";

const RULE_DOCS_URL = `${RULE_DOCS_URL_BASE}/prefer-ts-extras-is-safe-integer`;

/**
 * ESLint rule definition for `prefer-ts-extras-is-safe-integer`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsSafeIntegerRule: ReturnType<typeof createTypedRule> =
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
                        importedName: "isSafeInteger",
                        imports: tsExtrasImports,
                        memberName: "isSafeInteger",
                        messageId: "preferTsExtrasIsSafeInteger",
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
                    "require ts-extras isSafeInteger over Number.isSafeInteger for consistent predicate helper usage.",
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
            messages: {
                preferTsExtrasIsSafeInteger:
                    "Prefer `isSafeInteger` from `ts-extras` over `Number.isSafeInteger(...)`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-safe-integer",
    });

/**
 * Default export for the `prefer-ts-extras-is-safe-integer` rule module.
 */
export default preferTsExtrasIsSafeIntegerRule;
