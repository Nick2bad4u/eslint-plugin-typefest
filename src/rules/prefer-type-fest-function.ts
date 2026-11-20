/** @packageDocumentation ESLint rule for canonical TypeFest function signatures. */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { arrayFirst } from "ts-extras";

import { isGlobalTypeReferenceNamed } from "../_internal/type-reference-node.js";
import {
    createTypedRule,
    type TypedRuleContext,
} from "../_internal/typed-rule.js";
import { createUpstreamTypeReporter } from "../_internal/upstream-type-replacement.js";

/**
 * Classify the operand once while preserving the original rest annotation for
 * the fix.
 */
const getRestArguments = (node: Readonly<TSESTree.TypeNode>) => {
    if (node.type === AST_NODE_TYPES.TSTypeReference)
        return { anyArgs: false, node };
    const array =
        node.type === AST_NODE_TYPES.TSTypeOperator &&
        node.operator === "readonly"
            ? node.typeAnnotation
            : node;
    if (array?.type === AST_NODE_TYPES.TSArrayType) {
        return {
            anyArgs: array.elementType.type === AST_NODE_TYPES.TSAnyKeyword,
            node,
        };
    }
    return array?.type === AST_NODE_TYPES.TSTupleType
        ? { anyArgs: false, node }
        : undefined;
};

/**
 * Keep function-local type parameters and parameter bindings inside their
 * original scope.
 */
const getAliasSignature = (node: Readonly<TSESTree.TSFunctionType>) => {
    const rest = arrayFirst(node.params);
    if (
        rest?.type !== AST_NODE_TYPES.RestElement ||
        !rest.typeAnnotation ||
        !node.returnType
    )
        return undefined;
    const args = getRestArguments(rest.typeAnnotation.typeAnnotation);
    return args && { args, result: node.returnType.typeAnnotation };
};

const isSimpleResult = (node: TSESTree.TypeNode): boolean =>
    node.type.endsWith("Keyword") ||
    (node.type === AST_NODE_TYPES.TSTypeReference &&
        node.typeArguments === undefined &&
        node.typeName.type === AST_NODE_TYPES.Identifier);

/**
 * Restrict moved return operands to simple types that do not capture the
 * function's rest binding.
 */
const getSimplePromiseValue = (
    context: TypedRuleContext,
    result: TSESTree.TypeNode
) => {
    if (
        !isGlobalTypeReferenceNamed(context, result, "Promise") ||
        result.typeArguments?.params.length !== 1
    )
        return undefined;
    const value = arrayFirst(result.typeArguments.params);
    return value && isSimpleResult(value) ? value : undefined;
};

/**
 * Prefer TypeFest function types for canonical rest-argument function
 * signatures.
 */
const preferTypeFestFunctionRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const report = createUpstreamTypeReporter(context);
            return {
                "TSTypeAliasDeclaration > TSFunctionType:not([typeParameters])[params.length=1]"(
                    node: Readonly<TSESTree.TSFunctionType>
                ) {
                    const signature = getAliasSignature(node);
                    if (!signature) return;
                    const { args, result } = signature;
                    if (
                        args.anyArgs &&
                        result.type === AST_NODE_TYPES.TSUnknownKeyword
                    ) {
                        report(node, "AnyFunction");
                        return;
                    }
                    const value = getSimplePromiseValue(context, result);
                    if (!value) return;
                    if (
                        args.anyArgs &&
                        value.type === AST_NODE_TYPES.TSUnknownKeyword
                    ) {
                        report(node, "AnyAsyncFunction");
                    } else {
                        report(
                            node,
                            "AsyncFunction",
                            context.sourceCode.getText(args.node),
                            context.sourceCode.getText(value)
                        );
                    }
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest function types for canonical rest-argument function signatures.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                requiresUpstream: "type-fest@6",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-function",
            },
            fixable: "code",
            messages: {
                preferUpstreamType:
                    "Use `{{replacement}}` from type-fest for this type expression.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-function",
    });
export default preferTypeFestFunctionRule;
