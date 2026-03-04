import { reportTsExtrasGlobalMemberCall } from "../_internal/global-member-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-has-own`.
 */
import { createTypedRule } from "../_internal/typed-rule.js";

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
                        context,
                        importedName: "objectHasOwn",
                        imports: tsExtrasImports,
                        memberName: "hasOwn",
                        messageId: "preferTsExtrasObjectHasOwn",
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
                    "require ts-extras objectHasOwn over Object.hasOwn for own-property checks that should also narrow object types.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-has-own",
            },
            fixable: "code",
            messages: {
                preferTsExtrasObjectHasOwn:
                    "Prefer `objectHasOwn` from `ts-extras` over `Object.hasOwn` for own-property guards with stronger type narrowing.",
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
