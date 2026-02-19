/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-partial-deep`.
 */
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-partial-deep`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestPartialDeepRule: ReturnType<typeof createTypedRule> =
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
                        node.typeName.name !== "DeepPartial"
                    ) {
                        return;
                    }

                    const aliasReplacementFix =
                        createSafeTypeReferenceReplacementFix(
                            node,
                            "PartialDeep",
                            typeFestDirectImports
                        );

                    context.report({
                        ...(aliasReplacementFix
                            ? { fix: aliasReplacementFix }
                            : {}),
                        messageId: "preferPartialDeep",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest PartialDeep over `DeepPartial` aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-partial-deep.md",
            },
            fixable: "code",
            messages: {
                preferPartialDeep:
                    "Prefer `PartialDeep` from type-fest over `DeepPartial`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-partial-deep",
    });

/**
 * Default export for the `prefer-type-fest-partial-deep` rule module.
 */
export default preferTypeFestPartialDeepRule;
