import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const AWAITED_TYPE_NAME = "Awaited";
const RETURN_TYPE_NAME = "ReturnType";

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

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

const preferTypeFestAsyncReturnTypeRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-async-return-type",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest AsyncReturnType over Awaited<ReturnType<T>> compositions for async return extraction.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-async-return-type.md",
            },
            schema: [],
            messages: {
                preferAsyncReturnType:
                    "Prefer `AsyncReturnType<T>` from type-fest over `Awaited<ReturnType<T>>`.",
            },
        },
        defaultOptions: [],
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
                        node,
                        messageId: "preferAsyncReturnType",
                    });
                },
            };
        },
    });

export default preferTypeFestAsyncReturnTypeRule;
