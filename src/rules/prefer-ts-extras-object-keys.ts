/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-keys`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";

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
                        node.callee.property.name !== "keys"
                    ) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasObjectKeys",
                        node,
                        fix: createSafeValueReferenceReplacementFix({
                            context,
                            importedName: "objectKeys",
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
                    "require ts-extras objectKeys over Object.keys for stronger key inference.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-object-keys.md",
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
