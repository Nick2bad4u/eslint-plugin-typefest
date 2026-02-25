/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-async-return-type`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const AWAITED_TYPE_NAME = "Awaited";
const RETURN_TYPE_NAME = "ReturnType";

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
    node: Readonly<TSESTree.TypeNode>,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

/**
 * GetSingleTypeArgument helper.
 *
 * @param node - Value to inspect.
 *
 * @returns GetSingleTypeArgument helper result.
 */

const getSingleTypeArgument = (
    node: Readonly<TSESTree.TSTypeReference>
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

            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                "type-fest"
            );
            const { sourceCode } = context;

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

                    const returnTypeArgument =
                        getSingleTypeArgument(awaitedInnerType);

                    if (!returnTypeArgument) {
                        return;
                    }

                    const replacementFix = createSafeTypeNodeTextReplacementFix(
                        node,
                        "AsyncReturnType",
                        `AsyncReturnType<${sourceCode.getText(returnTypeArgument)}>`,
                        typeFestDirectImports
                    );

                    context.report({
                        ...(replacementFix ? { fix: replacementFix } : {}),
                        messageId: "preferAsyncReturnType",
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
                    "require TypeFest AsyncReturnType over Awaited<ReturnType<T>> compositions for async return extraction.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["type-fest/types"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-async-return-type",
            },
            fixable: "code",
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
