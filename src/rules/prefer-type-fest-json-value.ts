/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-json-value`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * Check whether the input is record like unknown.
 *
 * @param typeNode - Value to inspect.
 *
 * @returns `true` when the value is record like unknown; otherwise `false`.
 */

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
        (valueType?.type === "TSUnknownKeyword" ||
            valueType?.type === "TSAnyKeyword")
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-json-value`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestJsonValueRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
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
                        messageId: "preferJsonValue",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest JsonValue/JsonObject for payload and context-like contract types in serialization boundaries.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-json-value.md",
            },
            messages: {
                preferJsonValue:
                    "Use `JsonValue`/`JsonObject` from type-fest for payload/context contracts in serialization boundaries instead of Record<string, unknown>.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-json-value",
    });

/**
 * Default export for the `prefer-type-fest-json-value` rule module.
 */
export default preferTypeFestJsonValueRule;

