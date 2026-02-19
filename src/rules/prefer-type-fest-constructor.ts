/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-constructor`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-constructor`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestConstructorRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                TSConstructorType(node) {
                    if (node.abstract) {
                        return;
                    }

                    context.report({
                        messageId: "preferConstructorSignature",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest Constructor over explicit `new (...) => ...` constructor signatures.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-constructor.md",
            },
            messages: {
                preferConstructorSignature:
                    "Prefer `Constructor<...>` from type-fest over explicit `new (...) => ...` constructor signatures.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-constructor",
    });

/**
 * Default export for the `prefer-type-fest-constructor` rule module.
 */
export default preferTypeFestConstructorRule;
