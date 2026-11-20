/** @packageDocumentation Resolve type-fest references at their actual use site. */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import { getVariableInScopeChain } from "./scope-variable.js";

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
        binding?.defs.some((def) => {
            if (
                def.parent?.type !== AST_NODE_TYPES.ImportDeclaration ||
                def.parent.source.value !== "type-fest"
            )
                return false;
            if (isNamespace)
                return (
                    def.node.type === AST_NODE_TYPES.ImportNamespaceSpecifier
                );
            return (
                def.node.type === AST_NODE_TYPES.ImportSpecifier &&
                def.node.imported.type === AST_NODE_TYPES.Identifier &&
                def.node.imported.name === exportedName
            );
        }) ?? false
    );
};
