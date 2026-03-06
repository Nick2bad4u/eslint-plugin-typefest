import { reportTsExtrasGlobalMemberCall } from "../_internal/global-member-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-keys`.
 */
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-object-keys`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasObjectKeysRule: ReturnType<typeof createTypedRule> =
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
                        importedName: "objectKeys",
                        imports: tsExtrasImports,
                        memberName: "keys",
                        messageId: "preferTsExtrasObjectKeys",
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
                    "require ts-extras objectKeys over Object.keys for stronger key inference.",
                frozen: false,
                recommended: false,
                typefestConfigs: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
            },
            fixable: "code",
            messages: {
                preferTsExtrasObjectKeys:
                    "Prefer `objectKeys` from `ts-extras` over `Object.keys(...)` for stronger key inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-keys",
    });

/**
 * Default export for the `prefer-ts-extras-object-keys` rule module.
 */
export default preferTsExtrasObjectKeysRule;
