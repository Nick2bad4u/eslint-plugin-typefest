/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-json-primitive`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * Check whether the input is json primitive keyword node.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is json primitive keyword node; otherwise
 *   `false`.
 */

const isJsonPrimitiveKeywordNode = (
    node: Readonly<TSESTree.TypeNode>
): node is
    | TSESTree.TSBooleanKeyword
    | TSESTree.TSNullKeyword
    | TSESTree.TSNumberKeyword
    | TSESTree.TSStringKeyword =>
    node.type === "TSBooleanKeyword" ||
    node.type === "TSNullKeyword" ||
    node.type === "TSNumberKeyword" ||
    node.type === "TSStringKeyword";

/**
 * Check whether has json primitive union shape.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when has json primitive union shape; otherwise `false`.
 */

const hasJsonPrimitiveUnionShape = (
    node: Readonly<TSESTree.TSUnionType>
): boolean => {
    if (node.types.length !== 4) {
        return false;
    }

    let hasBoolean = false;
    let hasNull = false;
    let hasNumber = false;
    let hasString = false;

    for (const typeNode of node.types) {
        if (!isJsonPrimitiveKeywordNode(typeNode)) {
            return false;
        }

        if (typeNode.type === "TSBooleanKeyword") {
            hasBoolean = true;
            continue;
        }

        if (typeNode.type === "TSNullKeyword") {
            hasNull = true;
            continue;
        }

        if (typeNode.type === "TSNumberKeyword") {
            hasNumber = true;
            continue;
        }

        if (typeNode.type === "TSStringKeyword") {
            hasString = true;
            continue;
        }

        return false;
    }

    return hasBoolean && hasNull && hasNumber && hasString;
};

/**
 * ESLint rule definition for `prefer-type-fest-json-primitive`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestJsonPrimitiveRule: ReturnType<typeof createTypedRule> =
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
                TSUnionType(node) {
                    if (!hasJsonPrimitiveUnionShape(node)) {
                        return;
                    }

                    const replacementFix = createSafeTypeNodeReplacementFix(
                        node,
                        "JsonPrimitive",
                        typeFestDirectImports
                    );

                    context.report({
                        ...(replacementFix ? { fix: replacementFix } : {}),
                        messageId: "preferJsonPrimitive",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest JsonPrimitive over explicit null|boolean|number|string unions.",
                frozen: false,
                recommended: [
                    "typefest.configs.minimal",
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["type-fest/types"]',
                ],
                url: "https://eslint-plugin-typefest.nick2bad4u.com/rules/prefer-type-fest-json-primitive",
            },
            fixable: "code",
            messages: {
                preferJsonPrimitive:
                    "Prefer `JsonPrimitive` from type-fest over explicit primitive JSON keyword unions.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-json-primitive",
    });

/**
 * Default export for the `prefer-type-fest-json-primitive` rule module.
 */
export default preferTypeFestJsonPrimitiveRule;
