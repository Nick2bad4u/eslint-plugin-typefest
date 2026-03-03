import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-safe-integer`.
 */
import {
    createTypedRule,
    isGlobalIdentifierNamed,
} from "../_internal/typed-rule.js";

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
                    if (
                        node.callee.type !== "MemberExpression" ||
                        node.callee.computed
                    ) {
                        return;
                    }

                    if (
                        node.callee.object.type !== "Identifier" ||
                        node.callee.object.name !== "Number" ||
                        !isGlobalIdentifierNamed(
                            context,
                            node.callee.object,
                            "Number"
                        )
                    ) {
                        return;
                    }

                    if (
                        node.callee.property.type !== "Identifier" ||
                        node.callee.property.name !== "isSafeInteger"
                    ) {
                        return;
                    }

                    context.report({
                        fix: createSafeValueReferenceReplacementFix({
                            context,
                            importedName: "isSafeInteger",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                            targetNode: node.callee,
                        }),
                        messageId: "preferTsExtrasIsSafeInteger",
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
                    "require ts-extras isSafeInteger over Number.isSafeInteger for consistent predicate helper usage.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-safe-integer",
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
