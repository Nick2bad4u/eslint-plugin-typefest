import { type TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const READONLY_SET_TYPE_NAME = "ReadonlySet";

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

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

const preferTypeFestUnknownSetRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-unknown-set",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest UnknownSet over ReadonlySet<unknown> aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-unknown-set.md",
            },
            schema: [],
            messages: {
                preferUnknownSet:
                    "Prefer `UnknownSet` from type-fest over `ReadonlySet<unknown>`.",
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
                    if (
                        !isIdentifierTypeReference(node, READONLY_SET_TYPE_NAME)
                    ) {
                        return;
                    }

                    if (!hasSingleUnknownTypeArgument(node)) {
                        return;
                    }

                    context.report({
                        node,
                        messageId: "preferUnknownSet",
                    });
                },
            };
        },
    });

export default preferTypeFestUnknownSetRule;
