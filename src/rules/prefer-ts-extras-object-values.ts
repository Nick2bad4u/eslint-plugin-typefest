import { reportTsExtrasGlobalMemberCall } from "../_internal/global-member-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { RULE_DOCS_URL_BASE } from "../_internal/rule-docs-url.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-values`.
 */
import { createTypedRule } from "../_internal/typed-rule.js";

const RULE_DOCS_URL = `${RULE_DOCS_URL_BASE}/prefer-ts-extras-object-values`;

/**
 * ESLint rule definition for `prefer-ts-extras-object-values`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasObjectValuesRule: ReturnType<typeof createTypedRule> =
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
                        importedName: "objectValues",
                        imports: tsExtrasImports,
                        memberName: "values",
                        messageId: "preferTsExtrasObjectValues",
                        node,
                        objectName: "Object",
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras objectValues over Object.values for stronger value inference.",
                frozen: false,
                recommended: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: RULE_DOCS_URL,
            },
            fixable: "code",
            messages: {
                preferTsExtrasObjectValues:
                    "Prefer `objectValues` from `ts-extras` over `Object.values(...)` for stronger value inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-values",
    });

/**
 * Default export for the `prefer-ts-extras-object-values` rule module.
 */
export default preferTsExtrasObjectValuesRule;
