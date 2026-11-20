import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * Shared matchers for function-type wrappers built from `Parameters`,
 * `ReturnType`, and async return boxing helpers.
 */
import type { TypedRuleContext } from "./typed-rule.js";

import { areEquivalentTypeNodes } from "./normalize-expression-text.js";
import {
    isGlobalTypeReferenceNamed,
    unwrapParenthesizedTypeNode,
} from "./type-reference-node.js";

/**
 * Extract the sole type argument from a type reference.
 *
 * @param node - Type reference to inspect.
 *
 * @returns The only type argument when exactly one is present; otherwise
 *   `null`.
 */
const getSingleTypeArgument = (
    node: Readonly<TSESTree.TSTypeReference>
): null | Readonly<TSESTree.TypeNode> => {
    const typeArguments = node.typeArguments?.params ?? [];

    if (typeArguments.length !== 1) {
        return null;
    }

    const [onlyTypeArgument] = typeArguments;

    return onlyTypeArgument ?? null;
};

/**
 * Read a normalized type annotation from a function parameter node.
 *
 * @param parameter - Parameter node to inspect.
 *
 * @returns The unwrapped type annotation when present; otherwise `null`.
 */
const getParameterTypeAnnotation = (
    parameter: Readonly<TSESTree.Parameter>
): null | Readonly<TSESTree.TypeNode> => {
    if (parameter.type === AST_NODE_TYPES.Identifier) {
        return parameter.typeAnnotation === undefined
            ? null
            : unwrapParenthesizedTypeNode(
                  parameter.typeAnnotation.typeAnnotation
              );
    }

    if (parameter.type !== AST_NODE_TYPES.RestElement) {
        return null;
    }

    return parameter.typeAnnotation === undefined
        ? null
        : unwrapParenthesizedTypeNode(parameter.typeAnnotation.typeAnnotation);
};

/**
 * Match direct `(...args: Parameters<Function>) => ...` wrappers.
 *
 * @param context - Rule context used to resolve built-in type names.
 * @param node - Function type node to inspect.
 *
 * @returns The wrapped function type argument when the function has exactly one
 *   rest parameter typed as `Parameters<Function>`; otherwise `null`.
 */
export const getParametersFunctionArgumentFromFunctionType = (
    context: TypedRuleContext,
    node: Readonly<TSESTree.TSFunctionType>
): null | Readonly<TSESTree.TypeNode> => {
    if (node.params.length !== 1) {
        return null;
    }

    const [onlyParameter] = node.params;

    if (onlyParameter?.type !== AST_NODE_TYPES.RestElement) {
        return null;
    }

    const restParameterType = getParameterTypeAnnotation(onlyParameter);

    if (
        restParameterType?.type !== AST_NODE_TYPES.TSTypeReference ||
        !isGlobalTypeReferenceNamed(context, restParameterType, "Parameters")
    ) {
        return null;
    }

    return getSingleTypeArgument(restParameterType);
};

/**
 * Check whether a type node is `ReturnType<Function>` for a specific function.
 *
 * @param context - Rule context used to resolve built-in type names.
 * @param node - Candidate return type node.
 * @param functionType - Wrapped function type.
 *
 * @returns `true` when the node is `ReturnType<Function>`.
 */
export const isReturnTypeReferenceForFunction = (
    context: TypedRuleContext,
    node: Readonly<TSESTree.TypeNode>,
    functionType: Readonly<TSESTree.TypeNode>
): boolean => {
    const normalizedNode = unwrapParenthesizedTypeNode(node);

    if (
        normalizedNode.type !== AST_NODE_TYPES.TSTypeReference ||
        !isGlobalTypeReferenceNamed(context, normalizedNode, "ReturnType")
    ) {
        return false;
    }

    const referencedFunctionType = getSingleTypeArgument(normalizedNode);

    return (
        referencedFunctionType !== null &&
        areEquivalentTypeNodes(
            unwrapParenthesizedTypeNode(referencedFunctionType),
            unwrapParenthesizedTypeNode(functionType)
        )
    );
};

/**
 * Check whether a type node is `Promise<Awaited<ReturnType<Function>>>`.
 *
 * @param context - Rule context used to resolve built-in type names.
 * @param node - Candidate return type node.
 * @param functionType - Wrapped function type.
 *
 * @returns `true` when the node is the canonical asyncified return shape.
 */
export const isPromiseAwaitedReturnTypeReferenceForFunction = (
    context: TypedRuleContext,
    node: Readonly<TSESTree.TypeNode>,
    functionType: Readonly<TSESTree.TypeNode>
): boolean => {
    const normalizedNode = unwrapParenthesizedTypeNode(node);

    if (
        normalizedNode.type !== AST_NODE_TYPES.TSTypeReference ||
        !isGlobalTypeReferenceNamed(context, normalizedNode, "Promise")
    ) {
        return false;
    }

    const promisedType = getSingleTypeArgument(normalizedNode);

    if (
        promisedType?.type !== AST_NODE_TYPES.TSTypeReference ||
        !isGlobalTypeReferenceNamed(context, promisedType, "Awaited")
    ) {
        return false;
    }

    const awaitedInnerType = getSingleTypeArgument(promisedType);

    return (
        awaitedInnerType !== null &&
        isReturnTypeReferenceForFunction(
            context,
            awaitedInnerType,
            functionType
        )
    );
};
