import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-entries`.
 */
import { getEntriesEquivalentArgumentText } from "../_internal/entry-type-patterns.js";
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const ENTRIES_TYPE_NAME = "Entries" as const;

/**
 * ESLint rule definition for `prefer-type-fest-entries`.
 *
 * @remarks
 * Defines metadata, diagnostics, and fixes for this rule.
 */
const preferTypeFestEntriesRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const reportIfEntriesEquivalent = (
                node: Readonly<TSESTree.TSArrayType | TSESTree.TSTypeReference>
            ): void => {
                const entriesArgumentText = getEntriesEquivalentArgumentText({
                    node,
                    sourceCode: context.sourceCode,
                });

                if (
                    entriesArgumentText === null ||
                    entriesArgumentText.trim().length === 0
                ) {
                    return;
                }

                const fix = createSafeTypeNodeTextReplacementFix(
                    node,
                    ENTRIES_TYPE_NAME,
                    `${ENTRIES_TYPE_NAME}<${entriesArgumentText}>`,
                    typeFestDirectImports
                );

                reportWithOptionalFix({
                    context,
                    fix,
                    messageId: "preferEntries",
                    node,
                });
            };

            return {
                TSArrayType(node) {
                    reportIfEntriesEquivalent(node);
                },
                'TSTypeReference[typeName.type="Identifier"][typeName.name="Array"]'(
                    node: TSESTree.TSTypeReference
                ) {
                    reportIfEntriesEquivalent(node);
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest Entries over manual arrays of `[keyof T, T[keyof T]]` object entry tuple types.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-entries",
            },
            fixable: "code",
            messages: {
                preferEntries:
                    "Prefer `Entries<T>` from type-fest over manual arrays of `[keyof T, T[keyof T]]` object entry tuple types.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-entries",
    });

/**
 * Default export for the `prefer-type-fest-entries` rule module.
 */
export default preferTypeFestEntriesRule;
