/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-primitive`.
 */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const primitiveKeywordTypes = [
    AST_NODE_TYPES.TSBigIntKeyword,
    AST_NODE_TYPES.TSBooleanKeyword,
    AST_NODE_TYPES.TSNullKeyword,
    AST_NODE_TYPES.TSNumberKeyword,
    AST_NODE_TYPES.TSStringKeyword,
    AST_NODE_TYPES.TSSymbolKeyword,
    AST_NODE_TYPES.TSUndefinedKeyword,
] as const;

type PrimitiveKeywordType = (typeof primitiveKeywordTypes)[number];

const primitiveKeywordTypeSet = new Set<string>(primitiveKeywordTypes);

const isPrimitiveKeywordType = (
    candidate: string
): candidate is PrimitiveKeywordType => primitiveKeywordTypeSet.has(candidate);

/**
 * Check whether has primitive union shape.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when has primitive union shape; otherwise `false`.
 */

const hasPrimitiveUnionShape = (node: TSESTree.TSUnionType): boolean => {
    if (node.types.length !== primitiveKeywordTypes.length) {
        return false;
    }

    const presentPrimitiveTypes = new Set<PrimitiveKeywordType>();

    for (const typeNode of node.types) {
        if (!isPrimitiveKeywordType(typeNode.type)) {
            return false;
        }

        presentPrimitiveTypes.add(typeNode.type);
    }

    return presentPrimitiveTypes.size === primitiveKeywordTypes.length;
};

/**
 * ESLint rule definition for `prefer-type-fest-primitive`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestPrimitiveRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create (context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                "type-fest"
            );

            return {
                TSUnionType (node) {
                    if (!hasPrimitiveUnionShape(node)) {
                        return;
                    }

                    const replacementFix = createSafeTypeNodeReplacementFix(
                        node,
                        "Primitive",
                        typeFestDirectImports
                    );

                    context.report({
                        ...(replacementFix ? { fix: replacementFix } : {}),
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
            fixable: "code",
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
