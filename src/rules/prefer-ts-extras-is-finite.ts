import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { getIdentifierMemberCall } from "../_internal/member-call.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-finite`.
 */
import {
    createTypedRule,
    isGlobalIdentifierNamed,
} from "../_internal/typed-rule.js";

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
                    const numberIsFiniteCall = getIdentifierMemberCall({
                        memberName: "isFinite",
                        node,
                        objectName: "Number",
                    });

                    if (
                        numberIsFiniteCall === null ||
                        !isGlobalIdentifierNamed(
                            context,
                            numberIsFiniteCall.callee.object,
                            "Number"
                        )
                    ) {
                        return;
                    }

                    context.report({
                        fix: createSafeValueReferenceReplacementFix({
                            context,
                            importedName: "isFinite",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                            targetNode: numberIsFiniteCall.callee,
                        }),
                        messageId: "preferTsExtrasIsFinite",
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
                    "require ts-extras isFinite over Number.isFinite for consistent predicate helper usage.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-finite",
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
