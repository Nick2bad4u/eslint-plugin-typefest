import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-values`.
 */
import {
    createTypedRule,
    isGlobalIdentifierNamed,
} from "../_internal/typed-rule.js";

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
                    if (
                        node.callee.type !== "MemberExpression" ||
                        node.callee.computed
                    ) {
                        return;
                    }

                    if (
                        node.callee.object.type !== "Identifier" ||
                        node.callee.object.name !== "Object" ||
                        !isGlobalIdentifierNamed(
                            context,
                            node.callee.object,
                            "Object"
                        )
                    ) {
                        return;
                    }

                    if (
                        node.callee.property.type !== "Identifier" ||
                        node.callee.property.name !== "values"
                    ) {
                        return;
                    }

                    context.report({
                        fix: createSafeValueReferenceReplacementFix({
                            context,
                            importedName: "objectValues",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                            targetNode: node.callee,
                        }),
                        messageId: "preferTsExtrasObjectValues",
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
                    "require ts-extras objectValues over Object.values for stronger value inference.",
                frozen: false,
                recommended: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-values",
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
