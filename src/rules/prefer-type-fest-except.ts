/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-except`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const OMIT_TYPE_NAME = "Omit";
const exceptAliasReplacements = {
    HomomorphicOmit: "Except",
} as const;

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

/**
 * ESLint rule definition for `prefer-type-fest-except`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestExceptRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            const importedAliasMatches = collectImportedTypeAliasMatches(
                context.sourceCode,
                exceptAliasReplacements
            );

            return {
                TSTypeReference(node) {
                    const isBuiltinOmitReference = isIdentifierTypeReference(
                        node,
                        OMIT_TYPE_NAME
                    );

                    if (isBuiltinOmitReference) {
                        const typeArgumentCount =
                            node.typeArguments?.params.length ?? 0;
                        if (typeArgumentCount < 2) {
                            return;
                        }

                        context.report({
                            messageId: "preferExcept",
                            node,
                        });
                        return;
                    }

                    if (node.typeName.type !== "Identifier") {
                        return;
                    }

                    const importedAliasMatch = importedAliasMatches.get(
                        node.typeName.name
                    );
                    if (!importedAliasMatch) {
                        return;
                    }

                    context.report({
                        messageId: "preferExcept",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest Except over Omit when removing properties from object types.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-except.md",
            },
            messages: {
                preferExcept:
                    "Prefer `Except<T, K>` from type-fest over `Omit<T, K>` for stricter omitted-key modeling.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-except",
    });

/**
 * Default export for the `prefer-type-fest-except` rule module.
 */
export default preferTypeFestExceptRule;

