import { type TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const isRecordStringUnknown = (node: TSESTree.TSTypeReference): boolean => {
    if (
        node.typeName.type !== "Identifier" ||
        node.typeName.name !== "Record" ||
        node.typeArguments?.params.length !== 2
    ) {
        return false;
    }

    const [keyType, valueType] = node.typeArguments.params;
    return keyType?.type === "TSStringKeyword" && valueType?.type === "TSUnknownKeyword";
};

const preferTypeFestUnknownRecordRule = createTypedRule({
    name: "prefer-type-fest-unknown-record",
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require TypeFest UnknownRecord over Record<string, unknown> in architecture-critical layers.",
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-unknown-record.md",
        },
        schema: [],
        messages: {
            preferUnknownRecord:
                "Prefer `UnknownRecord` from type-fest over `Record<string, unknown>` for clearer intent and stronger shared typing conventions.",
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
                if (!isRecordStringUnknown(node)) {
                    return;
                }

                context.report({
                    node,
                    messageId: "preferUnknownRecord",
                });
            },
        };
    },
});

export default preferTypeFestUnknownRecordRule;
