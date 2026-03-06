import { reportTsExtrasGlobalMemberCall } from "../_internal/global-member-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-integer`.
 */
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-is-integer`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsIntegerRule: ReturnType<typeof createTypedRule> =
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
                        importedName: "isInteger",
                        imports: tsExtrasImports,
                        memberName: "isInteger",
                        messageId: "preferTsExtrasIsInteger",
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
                    "require ts-extras isInteger over Number.isInteger for consistent predicate helper usage.",
                frozen: false,
                recommended: true,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
            },
            fixable: "code",
            messages: {
                preferTsExtrasIsInteger:
                    "Prefer `isInteger` from `ts-extras` over `Number.isInteger(...)`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-integer",
    });

/**
 * Default export for the `prefer-ts-extras-is-integer` rule module.
 */
export default preferTsExtrasIsIntegerRule;
