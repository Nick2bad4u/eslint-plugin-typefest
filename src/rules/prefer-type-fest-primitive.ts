/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-primitive`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * Check whether the input is primitive keyword node.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is primitive keyword node; otherwise `false`.
 */

const isPrimitiveKeywordNode = (
    node: TSESTree.TypeNode
): node is
    | TSESTree.TSBigIntKeyword
    | TSESTree.TSBooleanKeyword
    | TSESTree.TSNullKeyword
    | TSESTree.TSNumberKeyword
    | TSESTree.TSStringKeyword
    | TSESTree.TSSymbolKeyword
    | TSESTree.TSUndefinedKeyword =>
    node.type === "TSBigIntKeyword" ||
    node.type === "TSBooleanKeyword" ||
    node.type === "TSNullKeyword" ||
    node.type === "TSNumberKeyword" ||
    node.type === "TSStringKeyword" ||
    node.type === "TSSymbolKeyword" ||
    node.type === "TSUndefinedKeyword";

/**
 * Check whether has primitive union shape.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when has primitive union shape; otherwise `false`.
 */

const hasPrimitiveUnionShape = (node: TSESTree.TSUnionType): boolean => {
    if (node.types.length !== 7) {
        return false;
    }

    let hasBigInt = false;
    let hasBoolean = false;
    let hasNull = false;
    let hasNumber = false;
    let hasString = false;
    let hasSymbol = false;
    let hasUndefined = false;

    for (const typeNode of node.types) {
        if (!isPrimitiveKeywordNode(typeNode)) {
            return false;
        }

        if (typeNode.type === "TSBigIntKeyword") {
            hasBigInt = true;
            continue;
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

        if (typeNode.type === "TSSymbolKeyword") {
            hasSymbol = true;
            continue;
        }

        if (typeNode.type === "TSUndefinedKeyword") {
            hasUndefined = true;
            continue;
        }

        return false;
    }

    return (
        hasBigInt &&
        hasBoolean &&
        hasNull &&
        hasNumber &&
        hasString &&
        hasSymbol &&
        hasUndefined
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-primitive`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
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
            docs: {
                description:
                    "require TypeFest Primitive over explicit primitive keyword unions.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-primitive.md",
            },
            messages: {
                preferPrimitive:
                    "Prefer `Primitive` from type-fest over explicit primitive keyword unions.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-primitive",
    });

/**
 * Default export for the `prefer-type-fest-primitive` rule module.
 */
export default preferTypeFestPrimitiveRule;
