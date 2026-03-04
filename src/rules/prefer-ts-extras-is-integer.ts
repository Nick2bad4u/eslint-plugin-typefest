import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { getIdentifierMemberCall } from "../_internal/member-call.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-integer`.
 */
import {
    createTypedRule,
    isGlobalIdentifierNamed,
} from "../_internal/typed-rule.js";

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
                    const numberIsIntegerCall = getIdentifierMemberCall({
                        memberName: "isInteger",
                        node,
                        objectName: "Number",
                    });

                    if (
                        numberIsIntegerCall === null ||
                        !isGlobalIdentifierNamed(
                            context,
                            numberIsIntegerCall.callee.object,
                            "Number"
                        )
                    ) {
                        return;
                    }

                    context.report({
                        fix: createSafeValueReferenceReplacementFix({
                            context,
                            importedName: "isInteger",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                            targetNode: numberIsIntegerCall.callee,
                        }),
                        messageId: "preferTsExtrasIsInteger",
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
                    "require ts-extras isInteger over Number.isInteger for consistent predicate helper usage.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-integer",
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
