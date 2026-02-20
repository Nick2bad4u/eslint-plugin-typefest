/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-json-value`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const isStringLikeKeyType = (node: TSESTree.TypeNode): boolean =>
    node.type === "TSStringKeyword" ||
    (node.type === "TSLiteralType" &&
        node.literal.type === "Literal" &&
        node.literal.value === "string");

const isRecordLikeUnknownOrAny = (
    typeNode: TSESTree.TSTypeReference
): boolean => {
    if (
        typeNode.typeName.type !== "Identifier" ||
        typeNode.typeName.name !== "Record" ||
        typeNode.typeArguments?.params.length !== 2
    ) {
        return false;
    }

    const [keyType, valueType] = typeNode.typeArguments.params;

    return (
        keyType !== undefined &&
        valueType !== undefined &&
        isStringLikeKeyType(keyType) &&
        (valueType.type === "TSUnknownKeyword" ||
            valueType.type === "TSAnyKeyword")
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

            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                "type-fest"
            );

            return {
                TSTypeReference(node) {
                    if (!isRecordLikeUnknownOrAny(node)) {
                        return;
                    }

                    const jsonObjectSuggestionFix =
                        createSafeTypeNodeReplacementFix(
                            node,
                            "JsonObject",
                            typeFestDirectImports
                        );

                    if (!jsonObjectSuggestionFix) {
                        context.report({
                            messageId: "preferJsonValue",
                            node,
                        });

                        return;
                    }

                    context.report({
                        messageId: "preferJsonValue",
                        node,
                        suggest: [
                            {
                                fix: jsonObjectSuggestionFix,
                                messageId: "suggestJsonObject",
                            },
                        ],
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
            hasSuggestions: true,
            messages: {
                preferJsonValue:
                    "Use `JsonValue`/`JsonObject` from type-fest for payload/context contracts in serialization boundaries instead of Record<string, unknown>.",
                suggestJsonObject:
                    "Replace with `JsonObject` from type-fest (review value constraints, this may narrow accepted shapes).",
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
