/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-json-object`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const JSON_VALUE_TYPE_NAME = "JsonValue";
const RECORD_TYPE_NAME = "Record";

/**
 * Check whether the input is identifier type reference.
 *
 * @param node - Value to inspect.
 * @param expectedTypeName - Value to inspect.
 *
 * @returns `true` when the value is identifier type reference; otherwise
 *   `false`.
 */

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

/**
 * Check whether the input is string key type.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is string key type; otherwise `false`.
 */

const isStringKeyType = (node: TSESTree.TypeNode): boolean =>
    node.type === "TSStringKeyword" ||
    (node.type === "TSLiteralType" &&
        node.literal.type === "Literal" &&
        node.literal.value === "string");

/**
 * Check whether the input is json value type.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is json value type; otherwise `false`.
 */

const isJsonValueType = (node: TSESTree.TypeNode): boolean =>
    isIdentifierTypeReference(node, JSON_VALUE_TYPE_NAME);

/**
 * Check whether the input is record json value reference.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is record json value reference; otherwise
 *   `false`.
 */

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

/**
 * ESLint rule definition for `prefer-type-fest-json-object`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestJsonObjectRule: ReturnType<typeof createTypedRule> =
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
                    if (!isRecordJsonValueReference(node)) {
                        return;
                    }

                    const replacementFix = createSafeTypeNodeReplacementFix(
                        node,
                        "JsonObject",
                        typeFestDirectImports
                    );

                    context.report({
                        ...(replacementFix ? { fix: replacementFix } : {}),
                        messageId: "preferJsonObject",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest JsonObject over equivalent Record<string, JsonValue> object aliases.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-json-object.md",
            },
            fixable: "code",
            messages: {
                preferJsonObject:
                    "Prefer `JsonObject` from type-fest over equivalent explicit JSON-object type shapes.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-json-object",
    });

/**
 * Default export for the `prefer-type-fest-json-object` rule module.
 */
export default preferTypeFestJsonObjectRule;
