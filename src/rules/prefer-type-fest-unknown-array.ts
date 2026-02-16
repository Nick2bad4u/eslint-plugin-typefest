import { type TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const ARRAY_TYPE_NAME = "Array";

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

const hasSingleUnknownTypeArgument = (node: TSESTree.TSTypeReference): boolean => {
    const typeArguments = node.typeArguments?.params ?? [];

    if (typeArguments.length !== 1) {
        return false;
    }

    const [firstTypeArgument] = typeArguments;
    return firstTypeArgument?.type === "TSUnknownKeyword";
};

const preferTypeFestUnknownArrayRule: ReturnType<typeof createTypedRule> = createTypedRule({
    name: "prefer-type-fest-unknown-array",
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require TypeFest UnknownArray over unknown[] and Array<unknown> aliases.",
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-unknown-array.md",
        },
        schema: [],
        messages: {
            preferUnknownArray:
                "Prefer `UnknownArray` from type-fest over `unknown[]` or `Array<unknown>`.",
        },
    },
    defaultOptions: [],
    create(context) {
        const filePath = context.filename ?? "";

        if (isTestFilePath(filePath)) {
            return {};
        }

        return {
            TSArrayType(node) {
                if (node.elementType.type !== "TSUnknownKeyword") {
                    return;
                }

                context.report({
                    node,
                    messageId: "preferUnknownArray",
                });
            },
            TSTypeReference(node) {
                if (!isIdentifierTypeReference(node, ARRAY_TYPE_NAME)) {
                    return;
                }

                if (!hasSingleUnknownTypeArgument(node)) {
                    return;
                }

                context.report({
                    node,
                    messageId: "preferUnknownArray",
                });
            },
        };
    },
});

export default preferTypeFestUnknownArrayRule;
