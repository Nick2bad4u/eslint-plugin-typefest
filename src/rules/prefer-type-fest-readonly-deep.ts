/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-readonly-deep`.
 */
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
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

            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                "type-fest"
            );

            return {
                TSTypeReference(node) {
                    if (
                        node.typeName.type !== "Identifier" ||
                        node.typeName.name !== "DeepReadonly"
                    ) {
                        return;
                    }

                    const aliasReplacementFix =
                        createSafeTypeReferenceReplacementFix(
                            node,
                            "ReadonlyDeep",
                            typeFestDirectImports
                        );

                    context.report({
                        ...(aliasReplacementFix
                            ? { fix: aliasReplacementFix }
                            : {}),
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
            fixable: "code",
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
