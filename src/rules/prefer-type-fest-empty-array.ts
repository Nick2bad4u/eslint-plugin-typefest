import { AST_NODE_TYPES } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-empty-array`.
 */
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Require TypeFest EmptyArray for an alias defining a readonly empty tuple. */
const preferTypeFestEmptyArrayRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return {
                TSTypeAliasDeclaration(node) {
                    const type = node.typeAnnotation;
                    if (
                        type.type === AST_NODE_TYPES.TSTypeOperator &&
                        type.operator === "readonly" &&
                        type.typeAnnotation?.type ===
                            AST_NODE_TYPES.TSTupleType &&
                        type.typeAnnotation.elementTypes.length === 0
                    ) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferEmptyArray",
                            node: type,
                        });
                    }
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest EmptyArray for aliases of readonly empty tuples.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                requiresUpstream: "type-fest@6",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-empty-array",
            },
            messages: {
                preferEmptyArray:
                    "Use `EmptyArray` from type-fest for this readonly empty tuple alias.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-empty-array",
    });

export default preferTypeFestEmptyArrayRule;
