/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-values`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";

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

            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

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
                        node.callee.object.name !== "Object"
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
                        messageId: "preferTsExtrasObjectValues",
                        node,
                        fix: createSafeValueReferenceReplacementFix({
                            context,
                            importedName: "objectValues",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                            targetNode: node.callee,
                        }),
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras objectValues over Object.values for stronger value inference.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-object-values.md",
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
