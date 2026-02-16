import { type TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const isRecordLikeUnknown = (typeNode: TSESTree.TSTypeReference): boolean => {
    if (
        typeNode.typeName.type !== "Identifier" ||
        typeNode.typeName.name !== "Record" ||
        typeNode.typeArguments?.params.length !== 2
    ) {
        return false;
    }

    const [keyType, valueType] = typeNode.typeArguments.params;

    return (
        keyType?.type === "TSStringKeyword" &&
        (valueType?.type === "TSUnknownKeyword" || valueType?.type === "TSAnyKeyword")
    );
};

const preferTypeFestJsonValueRule: ReturnType<typeof createTypedRule> = createTypedRule({
    name: "prefer-type-fest-json-value",
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require TypeFest JsonValue/JsonObject for payload and context-like contract types in serialization boundaries.",
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-json-value.md",
        },
        schema: [],
        messages: {
            preferJsonValue:
                "Use `JsonValue`/`JsonObject` from type-fest for payload/context contracts in serialization boundaries instead of Record<string, unknown>.",
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
                if (!isRecordLikeUnknown(node)) {
                    return;
                }

                context.report({
                    node,
                    messageId: "preferJsonValue",
                });
            },
        };
    },
});

export default preferTypeFestJsonValueRule;
