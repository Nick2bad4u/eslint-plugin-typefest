/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-writable-deep`.
 */
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { RULE_DOCS_URL_BASE } from "../_internal/rule-docs-url.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const RULE_DOCS_URL = `${RULE_DOCS_URL_BASE}/prefer-type-fest-writable-deep`;

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

                    reportWithOptionalFix({
                        context,
                        fix: aliasReplacementFix,
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
                url: RULE_DOCS_URL,
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
