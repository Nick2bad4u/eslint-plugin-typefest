import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-union-length`.
 */
import { arrayFirst } from "ts-extras";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-union-length`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestUnionLengthRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                TSIndexedAccessType(
                    node: Readonly<TSESTree.TSIndexedAccessType>
                ) {
                    const { indexType, objectType } = node;

                    // Require: objectType is TSTypeReference named "UnionToTuple"
                    if (
                        objectType.type !== AST_NODE_TYPES.TSTypeReference ||
                        objectType.typeName.type !==
                            AST_NODE_TYPES.Identifier ||
                        objectType.typeName.name !== "UnionToTuple"
                    ) {
                        return;
                    }

                    // Require: indexType is TSLiteralType with string literal "length"
                    if (
                        indexType.type !== AST_NODE_TYPES.TSLiteralType ||
                        indexType.literal.type !== AST_NODE_TYPES.Literal ||
                        indexType.literal.value !== "length"
                    ) {
                        return;
                    }

                    // Require: UnionToTuple has exactly one type argument to forward
                    const typeParams = objectType.typeArguments?.params;
                    if (typeParams?.length !== 1) {
                        return;
                    }

                    const typeArgText = context.sourceCode.getText(
                        arrayFirst(typeParams)
                    );
                    const replacementText = `UnionLength<${typeArgText}>`;

                    const replacementFix = createSafeTypeNodeTextReplacementFix(
                        node,
                        "UnionLength",
                        replacementText,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix: replacementFix,
                        messageId: "preferUnionLength",
                        node,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest `UnionLength` over `UnionToTuple<T>['length']`.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-union-length",
            },
            fixable: "code",
            messages: {
                preferUnionLength:
                    "Prefer `UnionLength<T>` from type-fest over `UnionToTuple<T>['length']`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-union-length",
    });

/**
 * Default export for the `prefer-type-fest-union-length` rule module.
 */
export default preferTypeFestUnionLengthRule;
