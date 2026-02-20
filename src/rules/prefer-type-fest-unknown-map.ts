/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-unknown-map`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const READONLY_MAP_TYPE_NAME = "ReadonlyMap";

/**
 * Check whether the input is identifier type reference.
 *
 * @param node - Value to inspect.
 * @param expectedTypeName - Value to inspect.
 *
 * @returns `true` when the value is identifier type reference; otherwise
 *   `false`.
 */

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

/**
 * Check whether has unknown map type arguments.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when has unknown map type arguments; otherwise `false`.
 */

const hasUnknownMapTypeArguments = (
    node: TSESTree.TSTypeReference
): boolean => {
    const typeArguments = node.typeArguments?.params ?? [];

    if (typeArguments.length !== 2) {
        return false;
    }

    const [firstTypeArgument, secondTypeArgument] = typeArguments;

    return (
        firstTypeArgument?.type === "TSUnknownKeyword" &&
        secondTypeArgument?.type === "TSUnknownKeyword"
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-unknown-map`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestUnknownMapRule: ReturnType<typeof createTypedRule> =
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
                        !isIdentifierTypeReference(node, READONLY_MAP_TYPE_NAME)
                    ) {
                        return;
                    }

                    if (!hasUnknownMapTypeArguments(node)) {
                        return;
                    }

                    const replacementFix = createSafeTypeNodeReplacementFix(
                        node,
                        "UnknownMap",
                        typeFestDirectImports
                    );

                    context.report({
                        ...(replacementFix ? { fix: replacementFix } : {}),
                        messageId: "preferUnknownMap",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest UnknownMap over ReadonlyMap<unknown, unknown> aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-unknown-map.md",
            },
            fixable: "code",
            messages: {
                preferUnknownMap:
                    "Prefer `UnknownMap` from type-fest over `ReadonlyMap<unknown, unknown>`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-unknown-map",
    });

/**
 * Default export for the `prefer-type-fest-unknown-map` rule module.
 */
export default preferTypeFestUnknownMapRule;
