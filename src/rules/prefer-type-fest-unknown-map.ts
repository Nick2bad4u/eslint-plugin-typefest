/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-unknown-map`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFixPreservingReadonly,
} from "../_internal/imported-type-aliases.js";
import { isIdentifierTypeReference } from "../_internal/type-reference-node.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const READONLY_MAP_TYPE_NAME = "ReadonlyMap";
const UNKNOWN_MAP_TYPE_NAME = "UnknownMap";

/**
 * Check whether has unknown map type arguments.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when has unknown map type arguments; otherwise `false`.
 */

const hasUnknownMapTypeArguments = (
    node: Readonly<TSESTree.TSTypeReference>
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

                    const replacementFix =
                        createSafeTypeNodeTextReplacementFixPreservingReadonly(
                            node,
                            UNKNOWN_MAP_TYPE_NAME,
                            UNKNOWN_MAP_TYPE_NAME,
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
            deprecated: false,
            docs: {
                description:
                    "require TypeFest UnknownMap over ReadonlyMap<unknown, unknown> aliases.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["type-fest/types"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unknown-map",
            },
            fixable: "code",
            messages: {
                preferUnknownMap:
                    "Prefer `Readonly<UnknownMap>` from type-fest over `ReadonlyMap<unknown, unknown>`.",
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
