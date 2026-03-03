/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-writable-deep`.
 */
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-writable-deep`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestWritableDeepRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                "type-fest"
            );

            return {
                TSTypeReference(node) {
                    if (
                        node.typeName.type !== "Identifier" ||
                        (node.typeName.name !== "DeepMutable" &&
                            node.typeName.name !== "MutableDeep")
                    ) {
                        return;
                    }

                    const aliasReplacementFix =
                        createSafeTypeReferenceReplacementFix(
                            node,
                            "WritableDeep",
                            typeFestDirectImports
                        );

                    context.report({
                        ...(aliasReplacementFix === null
                            ? {}
                            : { fix: aliasReplacementFix }),
                        messageId: "preferWritableDeep",
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
                    "require TypeFest WritableDeep over `DeepMutable` and `MutableDeep` aliases.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["type-fest/types"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable-deep",
            },
            fixable: "code",
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
