import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const JSON_VALUE_TYPE_NAME = "JsonValue";
const RECORD_TYPE_NAME = "Record";

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

const isStringKeyType = (node: TSESTree.TypeNode): boolean =>
    node.type === "TSStringKeyword" ||
    (node.type === "TSLiteralType" &&
        node.literal.type === "Literal" &&
        node.literal.value === "string");

const isJsonValueType = (node: TSESTree.TypeNode): boolean =>
    isIdentifierTypeReference(node, JSON_VALUE_TYPE_NAME);

const isRecordJsonValueReference = (
    node: TSESTree.TSTypeReference
): boolean => {
    if (!isIdentifierTypeReference(node, RECORD_TYPE_NAME)) {
        return false;
    }

    const typeArguments = node.typeArguments?.params ?? [];
    if (typeArguments.length !== 2) {
        return false;
    }

    const [keyType, valueType] = typeArguments;
    if (!keyType || !valueType) {
        return false;
    }

    return isStringKeyType(keyType) && isJsonValueType(valueType);
};

const preferTypeFestJsonObjectRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-json-object",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest JsonObject over equivalent Record<string, JsonValue> object aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-json-object.md",
            },
            schema: [],
            messages: {
                preferJsonObject:
                    "Prefer `JsonObject` from type-fest over equivalent explicit JSON-object type shapes.",
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
                    if (!isRecordJsonValueReference(node)) {
                        return;
                    }

                    context.report({
                        node,
                        messageId: "preferJsonObject",
                    });
                },
            };
        },
    });

export default preferTypeFestJsonObjectRule;
