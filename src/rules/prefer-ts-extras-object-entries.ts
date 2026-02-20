/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-entries`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";

/**
 * ESLint rule definition for `prefer-ts-extras-object-entries`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasObjectEntriesRule: ReturnType<typeof createTypedRule> =
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
                        node.callee.property.name !== "entries"
                    ) {
                        return;
                    }

                    context.report({
                        fix: createSafeValueReferenceReplacementFix({
                            context,
                            importedName: "objectEntries",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                            targetNode: node.callee,
                        }),
                        messageId: "preferTsExtrasObjectEntries",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras objectEntries over Object.entries for stronger key/value inference.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-object-entries.md",
            },
            fixable: "code",
            messages: {
                preferTsExtrasObjectEntries:
                    "Prefer `objectEntries` from `ts-extras` over `Object.entries(...)` for stronger key and value inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-entries",
    });

/**
 * Default export for the `prefer-ts-extras-object-entries` rule module.
 */
export default preferTsExtrasObjectEntriesRule;
