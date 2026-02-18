/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-async-return-type`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const AWAITED_TYPE_NAME = "Awaited";
const RETURN_TYPE_NAME = "ReturnType";

/**
 * Check whether is identifier type reference.
 *
 * @param node - Input value for node.
 * @param expectedTypeName - Input value for expectedTypeName.
 *
 * @returns `true` when is identifier type reference; otherwise `false`.
 */

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

/**
 * GetSingleTypeArgument helper.
 *
 * @param node - Input value for node.
 *
 * @returns Computed result for `getSingleTypeArgument`.
 */

const getSingleTypeArgument = (
    node: TSESTree.TSTypeReference
): null | TSESTree.TypeNode => {
    const typeArguments = node.typeArguments?.params ?? [];

    if (typeArguments.length !== 1) {
        return null;
    }

    const [onlyTypeArgument] = typeArguments;
    return onlyTypeArgument ?? null;
};

/**
 * ESLint rule definition for `prefer-type-fest-async-return-type`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestAsyncReturnTypeRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                TSTypeReference(node) {
                    if (!isIdentifierTypeReference(node, AWAITED_TYPE_NAME)) {
                        return;
                    }

                    const awaitedInnerType = getSingleTypeArgument(node);
                    if (awaitedInnerType?.type !== "TSTypeReference") {
                        return;
                    }

                    if (
                        !isIdentifierTypeReference(
                            awaitedInnerType,
                            RETURN_TYPE_NAME
                        )
                    ) {
                        return;
                    }

                    if (getSingleTypeArgument(awaitedInnerType) === null) {
                        return;
                    }

                    context.report({
                        messageId: "preferAsyncReturnType",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest AsyncReturnType over Awaited<ReturnType<T>> compositions for async return extraction.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-async-return-type.md",
            },
            messages: {
                preferAsyncReturnType:
                    "Prefer `AsyncReturnType<T>` from type-fest over `Awaited<ReturnType<T>>`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-async-return-type",
    });

/**
 * Default export for the `prefer-type-fest-async-return-type` rule module.
 */
export default preferTypeFestAsyncReturnTypeRule;

