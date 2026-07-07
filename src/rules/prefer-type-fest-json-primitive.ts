import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-json-primitive`.
 */
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * Narrows a type node to JSON-primitive keyword members.
 *
 * @param node - Type node to inspect.
 *
 * @returns `true` when the node is one of `boolean`, `null`, `number`, or
 *   `string` keyword types.
 */

const isJsonPrimitiveKeywordNode = (
    node: Readonly<TSESTree.TypeNode>
): node is | TSESTree.TSBooleanKeyword
| TSESTree.TSNullKeyword
| TSESTree.TSNumberKeyword
| TSESTree.TSStringKeyword =>
    node.type === AST_NODE_TYPES.TSBooleanKeyword ||
    node.type === AST_NODE_TYPES.TSNullKeyword ||
    node.type === AST_NODE_TYPES.TSNumberKeyword ||
    node.type === AST_NODE_TYPES.TSStringKeyword;

/**
 * Detects explicit JSON primitive unions that can be replaced with
 * `JsonPrimitive`.
 *
 * @param node - Union node to inspect.
 *
 * @returns `true` when the union contains exactly the four JSON primitive
 *   keyword members, regardless of order.
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

        if (typeNode.type === AST_NODE_TYPES.TSBooleanKeyword) {
            hasBoolean = true;
            continue;
        }

        if (typeNode.type === AST_NODE_TYPES.TSNullKeyword) {
            hasNull = true;
            continue;
        }

        if (typeNode.type === AST_NODE_TYPES.TSNumberKeyword) {
            hasNumber = true;
            continue;
        }

        hasString = true;
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
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
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

                    reportWithOptionalFix({
                        context,
                        fix: replacementFix,
                        messageId: "preferJsonPrimitive",
                        node,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest JsonPrimitive over explicit null|boolean|number|string unions.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.minimal",
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-json-primitive",
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
