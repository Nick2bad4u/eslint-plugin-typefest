/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-writable-deep`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-writable-deep`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestWritableDeepRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                TSTypeReference(node) {
                    if (
                        node.typeName.type !== "Identifier" ||
                        (node.typeName.name !== "DeepMutable" &&
                            node.typeName.name !== "MutableDeep")
                    ) {
                        return;
                    }

                    context.report({
                        messageId: "preferWritableDeep",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest WritableDeep over `DeepMutable` and `MutableDeep` aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-writable-deep.md",
            },
            messages: {
                preferWritableDeep:
                    "Prefer `WritableDeep` from type-fest over `DeepMutable`/`MutableDeep`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-writable-deep",
    });

/**
 * Default export for the `prefer-type-fest-writable-deep` rule module.
 */
export default preferTypeFestWritableDeepRule;
