/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-json-primitive`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

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
    node: TSESTree.TypeNode
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

const hasJsonPrimitiveUnionShape = (node: TSESTree.TSUnionType): boolean => {
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

            return {
                TSUnionType(node) {
                    if (!hasJsonPrimitiveUnionShape(node)) {
                        return;
                    }

                    context.report({
                        messageId: "preferJsonPrimitive",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest JsonPrimitive over explicit null|boolean|number|string unions.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-json-primitive.md",
            },
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
