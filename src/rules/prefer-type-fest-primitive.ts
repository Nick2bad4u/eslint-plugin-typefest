import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const primitiveKeywordKinds = new Set([
    "TSBigIntKeyword",
    "TSBooleanKeyword",
    "TSNullKeyword",
    "TSNumberKeyword",
    "TSStringKeyword",
    "TSSymbolKeyword",
    "TSUndefinedKeyword",
]);

const isPrimitiveKeywordNode = (
    node: TSESTree.TypeNode
): node is
    | TSESTree.TSBigIntKeyword
    | TSESTree.TSBooleanKeyword
    | TSESTree.TSNullKeyword
    | TSESTree.TSNumberKeyword
    | TSESTree.TSStringKeyword
    | TSESTree.TSSymbolKeyword
    | TSESTree.TSUndefinedKeyword => primitiveKeywordKinds.has(node.type);

const hasPrimitiveUnionShape = (node: TSESTree.TSUnionType): boolean => {
    const primitiveMembers = node.types.filter((typeNode) =>
        isPrimitiveKeywordNode(typeNode)
    );
    if (primitiveMembers.length !== 7) {
        return false;
    }

    const uniqueKinds = new Set(
        primitiveMembers.map((typeNode) => typeNode.type)
    );
    return uniqueKinds.size === primitiveKeywordKinds.size;
};

const preferTypeFestPrimitiveRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                TSUnionType(node) {
                    if (!hasPrimitiveUnionShape(node)) {
                        return;
                    }

                    context.report({
                        messageId: "preferPrimitive",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest Primitive over explicit primitive keyword unions.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-primitive.md",
            },
            schema: [],
            messages: {
                preferPrimitive:
                    "Prefer `Primitive` from type-fest over explicit primitive keyword unions.",
            },
        },
        name: "prefer-type-fest-primitive",
    });

export default preferTypeFestPrimitiveRule;
