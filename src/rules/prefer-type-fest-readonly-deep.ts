/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-readonly-deep`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-readonly-deep`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestReadonlyDeepRule: ReturnType<typeof createTypedRule> =
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
                        node.typeName.name !== "DeepReadonly"
                    ) {
                        return;
                    }

                    context.report({
                        messageId: "preferReadonlyDeep",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest ReadonlyDeep over `DeepReadonly` aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-readonly-deep.md",
            },
            messages: {
                preferReadonlyDeep:
                    "Prefer `ReadonlyDeep` from type-fest over `DeepReadonly`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-readonly-deep",
    });

/**
 * Default export for the `prefer-type-fest-readonly-deep` rule module.
 */
export default preferTypeFestReadonlyDeepRule;
