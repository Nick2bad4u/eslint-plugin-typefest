/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-entry`.
 */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import { getParentNode } from "../_internal/ast-node.js";
import {
    getEntriesEquivalentArgumentText,
    getEntryEquivalentArgumentText,
} from "../_internal/entry-type-patterns.js";
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const ENTRY_TYPE_NAME = "Entry" as const;

const isEntriesEquivalentAncestor = (
    node: null | Readonly<TSESTree.Node> | undefined,
    sourceCode: Readonly<TSESLint.SourceCode>
): boolean =>
    Boolean(
        node &&
        (node.type === AST_NODE_TYPES.TSArrayType ||
            node.type === AST_NODE_TYPES.TSTypeReference) &&
        getEntriesEquivalentArgumentText({
            node,
            sourceCode,
        }) !== null
    );

/**
 * ESLint rule definition for `prefer-type-fest-entry`.
 *
 * @remarks
 * Defines metadata, diagnostics, and fixes for this rule.
 */
const preferTypeFestEntryRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                TSTupleType(node) {
                    const parent = getParentNode(node);
                    const grandparent = parent ? getParentNode(parent) : null;

                    if (
                        isEntriesEquivalentAncestor(
                            parent,
                            context.sourceCode
                        ) ||
                        isEntriesEquivalentAncestor(
                            grandparent,
                            context.sourceCode
                        )
                    ) {
                        return;
                    }

                    const entryArgumentText = getEntryEquivalentArgumentText({
                        node,
                        sourceCode: context.sourceCode,
                    });

                    if (
                        entryArgumentText === null ||
                        entryArgumentText.trim().length === 0
                    ) {
                        return;
                    }

                    const fix = createSafeTypeNodeTextReplacementFix(
                        node,
                        ENTRY_TYPE_NAME,
                        `${ENTRY_TYPE_NAME}<${entryArgumentText}>`,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix,
                        messageId: "preferEntry",
                        node,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest Entry over manual `[keyof T, T[keyof T]]` object entry tuple types.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-entry",
            },
            fixable: "code",
            messages: {
                preferEntry:
                    "Prefer `Entry<T>` from type-fest over manual `[keyof T, T[keyof T]]` object entry tuple types.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-entry",
    });

/**
 * Default export for the `prefer-type-fest-entry` rule module.
 */
export default preferTypeFestEntryRule;
