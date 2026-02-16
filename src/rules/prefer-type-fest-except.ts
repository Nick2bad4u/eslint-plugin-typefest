import { type TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const OMIT_TYPE_NAME = "Omit";

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

const preferTypeFestExceptRule: ReturnType<typeof createTypedRule> = createTypedRule({
    name: "prefer-type-fest-except",
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require TypeFest Except over Omit when removing properties from object types.",
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-except.md",
        },
        schema: [],
        messages: {
            preferExcept:
                "Prefer `Except<T, K>` from type-fest over `Omit<T, K>` for stricter omitted-key modeling.",
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
                if (!isIdentifierTypeReference(node, OMIT_TYPE_NAME)) {
                    return;
                }

                const typeArgumentCount = node.typeArguments?.params.length ?? 0;
                if (typeArgumentCount < 2) {
                    return;
                }

                context.report({
                    node,
                    messageId: "preferExcept",
                });
            },
        };
    },
});

export default preferTypeFestExceptRule;
