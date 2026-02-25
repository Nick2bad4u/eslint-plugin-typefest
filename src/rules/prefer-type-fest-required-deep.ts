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
                        ...(aliasReplacementFix === null
                            ? {}
                            : { fix: aliasReplacementFix }),
                        messageId: "preferRequiredDeep",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest RequiredDeep over `DeepRequired` aliases.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["type-fest/types"]',
                ],
                url: "https://eslint-plugin-typefest.nick2bad4u.com/rules/prefer-type-fest-required-deep",
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
