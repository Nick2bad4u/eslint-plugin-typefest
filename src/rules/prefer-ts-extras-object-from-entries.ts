/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-from-entries`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";

/**
 * ESLint rule definition for `prefer-ts-extras-object-from-entries`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasObjectFromEntriesRule: ReturnType<typeof createTypedRule> =
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
                        node.callee.property.name !== "fromEntries"
                    ) {
                        return;
                    }

                    context.report({
                        fix: createSafeValueReferenceReplacementFix({
                            context,
                            importedName: "objectFromEntries",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                            targetNode: node.callee,
                        }),
                        messageId: "preferTsExtrasObjectFromEntries",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras objectFromEntries over Object.fromEntries for stronger key/value inference.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-object-from-entries.md",
            },
            fixable: "code",
            messages: {
                preferTsExtrasObjectFromEntries:
                    "Prefer `objectFromEntries` from `ts-extras` over `Object.fromEntries(...)` for stronger key and value inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-from-entries",
    });

/**
 * Default export for the `prefer-ts-extras-object-from-entries` rule module.
 */
export default preferTsExtrasObjectFromEntriesRule;
