/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-writable`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const writableAliasReplacements = {
    Mutable: "Writable",
} as const;

/**
 * NormalizeTypeText helper.
 *
 * @param text - Value to inspect.
 *
 * @returns NormalizeTypeText helper result.
 */

const normalizeTypeText = (text: string): string => text.replaceAll(/\s+/g, "");

/**
 * NormalizeTypeNodeText helper.
 *
 * @param sourceCode - Value to inspect.
 * @param node - Value to inspect.
 *
 * @returns NormalizeTypeNodeText helper result.
 */

const normalizeTypeNodeText = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: TSESTree.TypeNode
): string => normalizeTypeText(sourceCode.getText(node));

/**
 * Check whether has writable mapped type shape.
 *
 * @param sourceCode - Value to inspect.
 * @param node - Value to inspect.
 *
 * @returns `true` when has writable mapped type shape; otherwise `false`.
 */

const hasWritableMappedTypeShape = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: TSESTree.TSMappedType
): boolean => {
    if (node.readonly !== "-") {
        return false;
    }

    if (node.optional !== false) {
        return false;
    }

    if (node.nameType !== null) {
        return false;
    }


    const { constraint } = node;
    if (constraint?.type !== "TSTypeOperator") {
        return false;
    }

    if (constraint.operator !== "keyof") {
        return false;
    }

    const baseType = constraint.typeAnnotation;
    if (!baseType) {
        return false;
    }

    const { typeAnnotation } = node;
    if (typeAnnotation?.type !== "TSIndexedAccessType") {
        return false;
    }

    const indexedObjectTypeText = normalizeTypeNodeText(
        sourceCode,
        typeAnnotation.objectType
    );
    const baseTypeText = normalizeTypeNodeText(sourceCode, baseType);

    if (indexedObjectTypeText !== baseTypeText) {
        return false;
    }

    const { indexType } = typeAnnotation;
    if (
        indexType.type !== "TSTypeReference" ||
        indexType.typeName.type !== "Identifier"
    ) {
        return false;
    }

    return (
        node.key.type === "Identifier" &&
        indexType.typeName.name === node.key.name
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-writable`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestWritableRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename;

            if (isTestFilePath(filePath)) {
                return {};
            }

            const { sourceCode } = context;
            const importedAliasMatches = collectImportedTypeAliasMatches(
                sourceCode,
                writableAliasReplacements
            );
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                sourceCode,
                "type-fest"
            );

            return {
                TSMappedType(node) {
                    if (!hasWritableMappedTypeShape(sourceCode, node)) {
                        return;
                    }

                    context.report({
                        messageId: "preferWritable",
                        node,
                    });
                },
                TSTypeReference(node) {
                    if (node.typeName.type !== "Identifier") {
                        return;
                    }

                    const importedAliasMatch = importedAliasMatches.get(
                        node.typeName.name
                    );
                    if (!importedAliasMatch) {
                        return;
                    }

                    const aliasReplacementFix =
                        createSafeTypeReferenceReplacementFix(
                            node,
                            importedAliasMatch.replacementName,
                            typeFestDirectImports
                        );

                    context.report({
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                        ...(aliasReplacementFix
                            ? { fix: aliasReplacementFix }
                            : {}),
                        messageId: "preferWritableAlias",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest Writable over manual mapped types that strip readonly with -readonly.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-writable.md",
            },
            fixable: "code",
            messages: {
                preferWritable:
                    "Prefer `Writable<T>` from type-fest over `{-readonly [K in keyof T]: T[K]}`.",
                preferWritableAlias:
                    "Prefer `{{replacement}}` from type-fest over `{{alias}}`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-writable",
    });

/**
 * Default export for the `prefer-type-fest-writable` rule module.
 */
export default preferTypeFestWritableRule;
