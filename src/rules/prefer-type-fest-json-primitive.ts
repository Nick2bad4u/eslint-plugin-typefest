import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const jsonPrimitiveKinds = new Set([
    "TSBooleanKeyword",
    "TSNullKeyword",
    "TSNumberKeyword",
    "TSStringKeyword",
]);

const isJsonPrimitiveKeywordNode = (
    node: TSESTree.TypeNode
): node is
    | TSESTree.TSBooleanKeyword
    | TSESTree.TSNullKeyword
    | TSESTree.TSNumberKeyword
    | TSESTree.TSStringKeyword => jsonPrimitiveKinds.has(node.type);

const hasJsonPrimitiveUnionShape = (node: TSESTree.TSUnionType): boolean => {
    const primitiveMembers = node.types.filter((typeNode) =>
        isJsonPrimitiveKeywordNode(typeNode)
    );
    if (primitiveMembers.length !== 4) {
        return false;
    }

    const uniqueKinds = new Set(
        primitiveMembers.map((typeNode) => typeNode.type)
    );
    return uniqueKinds.size === jsonPrimitiveKinds.size;
};

const preferTypeFestJsonPrimitiveRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-json-primitive",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest JsonPrimitive over explicit null|boolean|number|string unions.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-json-primitive.md",
            },
            schema: [],
            messages: {
                preferJsonPrimitive:
                    "Prefer `JsonPrimitive` from type-fest over explicit primitive JSON keyword unions.",
            },
        },
        defaultOptions: [],
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                TSUnionType(node) {
                    if (!hasJsonPrimitiveUnionShape(node)) {
                        return;
                    }

                    context.report({
                        node,
                        messageId: "preferJsonPrimitive",
                    });
                },
            };
        },
    });

export default preferTypeFestJsonPrimitiveRule;
