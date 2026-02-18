/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-unknown-map`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const READONLY_MAP_TYPE_NAME = "ReadonlyMap";

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

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

const preferTypeFestUnknownMapRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

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

                    context.report({
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
            messages: {
                preferUnknownMap:
                    "Prefer `UnknownMap` from type-fest over `ReadonlyMap<unknown, unknown>`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-unknown-map",
    });

export default preferTypeFestUnknownMapRule;
