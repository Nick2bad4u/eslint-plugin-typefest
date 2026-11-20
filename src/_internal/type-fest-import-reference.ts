/** @packageDocumentation Resolve type-fest references at their actual use site. */
import {
    AST_NODE_TYPES,
    ASTUtils,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import { getVariableInScopeChain } from "./scope-variable.js";

/** Identify the original package and import specifier of a resolved binding. */
export const matchesTypeFestDefinition = (
    def: Readonly<TSESLint.Scope.Definition>,
    exportedName: string,
    namespace = false
): boolean => {
    if (
        def.parent?.type !== AST_NODE_TYPES.ImportDeclaration ||
        def.parent.source.value !== "type-fest"
    )
        return false;
    return namespace
        ? def.node.type === AST_NODE_TYPES.ImportNamespaceSpecifier
        : def.node.type === AST_NODE_TYPES.ImportSpecifier &&
              ASTUtils.isIdentifier(def.node.imported) &&
              def.node.imported.name === exportedName;
};

/**
 * Recognize named, aliased or namespace imports, including nested
 * type-parameter shadowing.
 */
export const isTypeFestImport = (
    source: Readonly<TSESLint.SourceCode>,
    reference: Readonly<TSESTree.TSTypeReference>,
    exportedName: string
): boolean => {
    const name = reference.typeName;
    const isNamespace = name.type === AST_NODE_TYPES.TSQualifiedName;
    if (
        isNamespace &&
        (name.right.name !== exportedName ||
            name.left.type !== AST_NODE_TYPES.Identifier)
    )
        return false;
    const identifier = isNamespace ? name.left : name;
    if (identifier.type !== AST_NODE_TYPES.Identifier) return false;
    const binding = getVariableInScopeChain(
        source.getScope(identifier),
        identifier.name
    );
    return (
        binding?.defs.some((def) =>
            matchesTypeFestDefinition(def, exportedName, isNamespace)
        ) ?? false
    );
};
