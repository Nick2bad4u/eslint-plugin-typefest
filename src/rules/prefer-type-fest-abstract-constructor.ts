/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-abstract-constructor`.
 */
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-abstract-constructor`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestAbstractConstructorRule: ReturnType<
    typeof createTypedRule
> = createTypedRule({
    create(context) {
        const filePath = context.filename ?? "";

        if (isTestFilePath(filePath)) {
            return {};
        }

        return {
            TSConstructorType(node) {
                if (!node.abstract) {
                    return;
                }

                context.report({
                    messageId: "preferAbstractConstructorSignature",
                    node,
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        docs: {
            description:
                "require TypeFest AbstractConstructor over explicit `abstract new (...) => ...` signatures.",
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-abstract-constructor.md",
        },
        messages: {
            preferAbstractConstructorSignature:
                "Prefer `AbstractConstructor<...>` from type-fest over explicit `abstract new (...) => ...` signatures.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "prefer-type-fest-abstract-constructor",
});

/**
 * Default export for the `prefer-type-fest-abstract-constructor` rule module.
 */
export default preferTypeFestAbstractConstructorRule;
