import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { arrayFirst } from "ts-extras";

/**
 * @packageDocumentation
 * Shared AST pattern helpers for TypeFest `Has*Keys` rules.
 */
import { setContainsValue } from "./set-membership.js";
import { hasFalseTrueBranches } from "./type-guard-conditional-patterns.js";

const getSingleTypeArgument = (
    node: Readonly<TSESTree.TSTypeReference>
): TSESTree.TypeNode | undefined => {
    const typeArguments = node.typeArguments?.params;

    return typeArguments?.length === 1 ? arrayFirst(typeArguments) : undefined;
};

const isDirectKeysOfReference = (
    node: Readonly<TSESTree.TSTypeReference>,
    keysOfLocalNames: ReadonlySet<string>
): boolean =>
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    setContainsValue(keysOfLocalNames, node.typeName.name);

const isNamespaceKeysOfReference = (
    node: Readonly<TSESTree.TSTypeReference>,
    typeFestNamespaceImportNames: ReadonlySet<string>,
    keysOfTypeName: string
): boolean =>
    node.typeName.type === AST_NODE_TYPES.TSQualifiedName &&
    node.typeName.left.type === AST_NODE_TYPES.Identifier &&
    setContainsValue(typeFestNamespaceImportNames, node.typeName.left.name) &&
    node.typeName.right.name === keysOfTypeName;

/**
 * Extract `T` from `KeysOf<T> extends never ? false : true`.
 */
export const getHasKeysInputType = (
    node: Readonly<TSESTree.TSConditionalType>,
    keysOfLocalNames: ReadonlySet<string>,
    typeFestNamespaceImportNames: ReadonlySet<string>,
    keysOfTypeName: string
): TSESTree.TypeNode | undefined => {
    if (
        !hasFalseTrueBranches(node) ||
        node.extendsType.type !== AST_NODE_TYPES.TSNeverKeyword ||
        node.checkType.type !== AST_NODE_TYPES.TSTypeReference ||
        (!isDirectKeysOfReference(node.checkType, keysOfLocalNames) &&
            !isNamespaceKeysOfReference(
                node.checkType,
                typeFestNamespaceImportNames,
                keysOfTypeName
            ))
    ) {
        return undefined;
    }

    return getSingleTypeArgument(node.checkType);
};
