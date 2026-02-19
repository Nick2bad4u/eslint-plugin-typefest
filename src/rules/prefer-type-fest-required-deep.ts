/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-required-deep`.
 */
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-required-deep`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestRequiredDeepRule: ReturnType<typeof createTypedRule> =
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
                        node.typeName.name !== "DeepRequired"
                    ) {
                        return;
                    }

                    const aliasReplacementFix =
                        createSafeTypeReferenceReplacementFix(
                            node,
                            "RequiredDeep",
                            typeFestDirectImports
                        );

                    context.report({
                        ...(aliasReplacementFix
                            ? { fix: aliasReplacementFix }
                            : {}),
                        messageId: "preferRequiredDeep",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest RequiredDeep over `DeepRequired` aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-required-deep.md",
            },
            fixable: "code",
            messages: {
                preferRequiredDeep:
                    "Prefer `RequiredDeep` from type-fest over `DeepRequired`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-required-deep",
    });

/**
 * Default export for the `prefer-type-fest-required-deep` rule module.
 */
export default preferTypeFestRequiredDeepRule;
