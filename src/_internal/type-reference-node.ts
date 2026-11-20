import type { UnknownArray } from "type-fest";

import {
    AST_NODE_TYPES,
    TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import { resolveFirstValueInLinkedStructure } from "./cycle-safe-linked-search.js";
import { safeTypeOperation } from "./safe-type-operation.js";
import { getScopeFromContextSourceCode } from "./scope-resolution.js";

/**
 * @packageDocumentation
 * Predicate helpers for narrowing `TSTypeReference` nodes by identifier name.
 */

const TS_PARENTHESIZED_TYPE = "TSParenthesizedType";

const isTypeNodeLike = (value: unknown): value is Readonly<TSESTree.TypeNode> =>
    typeof value === "object" &&
    value !== null &&
    typeof Reflect.get(value, "type") === "string";

/**
 * Checks whether a type node is an identifier-based type reference with a
 * specific symbol name.
 *
 * @param node - Type node candidate.
 * @param identifierName - Expected referenced identifier name.
 *
 * @returns `true` when the node is `TSTypeReference` and the referenced
 *   `typeName` identifier matches exactly.
 */
export const isIdentifierTypeReference = (
    node: Readonly<TSESTree.TypeNode>,
    identifierName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === AST_NODE_TYPES.TSTypeReference &&
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    node.typeName.name === identifierName;

/**
 * Checks whether a type node references a global type, such as a built-in
 * TypeScript utility type, rather than a same-named local type.
 *
 * @remarks
 * A type declared in any enclosing non-global scope (type alias, interface,
 * class, enum, import, or type parameter) shadows the global type. Value-only
 * bindings such as `const Omit = 1` do not, because types and values live in
 * separate namespaces. Declarations in the global scope itself, such as
 * interface merging in a script file, augment the global type instead of
 * replacing it, so they still count as global.
 *
 * @param context - Rule context used for scope resolution.
 * @param node - Type node candidate.
 * @param typeName - Expected global type name.
 *
 * @returns `true` when the node is an identifier type reference with the
 *   expected name that resolves to the global type.
 */
export const isGlobalTypeReferenceNamed = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
    node: Readonly<TSESTree.TypeNode>,
    typeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } => {
    if (!isIdentifierTypeReference(node, typeName)) {
        return false;
    }

    const result = safeTypeOperation({
        operation: () => {
            const lookupResult = resolveFirstValueInLinkedStructure<
                Readonly<TSESLint.Scope.Scope>,
                boolean
            >({
                getNextNode: (scope) => scope.upper,
                resolveValue: (scope) => {
                    if (scope.type === TSESLint.Scope.ScopeType.global) {
                        return { found: true, value: true };
                    }

                    const isShadowedInScope =
                        scope.set
                            .get(typeName)
                            ?.defs.some(
                                (definition) => definition.isTypeDefinition
                            ) === true;

                    return isShadowedInScope
                        ? { found: true, value: false }
                        : { found: false };
                },
                startNode: getScopeFromContextSourceCode(context, node),
            });

            return !lookupResult.found || lookupResult.value;
        },
        reason: "scope-resolution-failed",
    });

    if (!result.ok) {
        return false;
    }

    return result.value;
};

/**
 * Unwrap transparent parenthesized type nodes.
 *
 * @param node - Type node to normalize.
 *
 * @returns The innermost non-parenthesized type node.
 */
export const unwrapParenthesizedTypeNode = (
    node: Readonly<TSESTree.TypeNode>
): Readonly<TSESTree.TypeNode> => {
    const nodeObject: object = node;
    const nodeType: unknown = Reflect.get(nodeObject, "type");

    if (nodeType !== TS_PARENTHESIZED_TYPE) {
        return node;
    }

    const typeAnnotation: unknown = Reflect.get(nodeObject, "typeAnnotation");

    return isTypeNodeLike(typeAnnotation)
        ? unwrapParenthesizedTypeNode(typeAnnotation)
        : node;
};
