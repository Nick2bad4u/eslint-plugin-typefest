/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-unknown-set`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const READONLY_SET_TYPE_NAME = "ReadonlySet";

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
 * Check whether has single unknown type argument.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when has single unknown type argument; otherwise `false`.
 */

const hasSingleUnknownTypeArgument = (
    node: TSESTree.TSTypeReference
): boolean => {
    const typeArguments = node.typeArguments?.params ?? [];

    if (typeArguments.length !== 1) {
        return false;
    }

    const [firstTypeArgument] = typeArguments;
    return firstTypeArgument?.type === "TSUnknownKeyword";
};

/**
 * ESLint rule definition for `prefer-type-fest-unknown-set`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestUnknownSetRule: ReturnType<typeof createTypedRule> =
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
                        !isIdentifierTypeReference(node, READONLY_SET_TYPE_NAME)
                    ) {
                        return;
                    }

                    if (!hasSingleUnknownTypeArgument(node)) {
                        return;
                    }

                    const replacementFix = createSafeTypeNodeReplacementFix(
                        node,
                        "UnknownSet",
                        typeFestDirectImports
                    );

                    context.report({
                        ...(replacementFix ? { fix: replacementFix } : {}),
                        messageId: "preferUnknownSet",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest UnknownSet over ReadonlySet<unknown> aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-unknown-set.md",
            },
            fixable: "code",
            messages: {
                preferUnknownSet:
                    "Prefer `UnknownSet` from type-fest over `ReadonlySet<unknown>`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-unknown-set",
    });

/**
 * Default export for the `prefer-type-fest-unknown-set` rule module.
 */
export default preferTypeFestUnknownSetRule;
