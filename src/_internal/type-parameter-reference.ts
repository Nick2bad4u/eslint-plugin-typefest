import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

/**
 * Check that a bare type reference resolves to the indicated generic parameter
 * or mapped key. A same-named parameter can shadow the outer one in a mapped
 * type, including within the key constraint.
 */
export const isTypeParameterReference = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    declaration: Readonly<TSESTree.TSMappedType | TSESTree.TSTypeParameter>,
    candidate: Readonly<TSESTree.TypeNode>
): boolean =>
    candidate.type === AST_NODE_TYPES.TSTypeReference &&
    candidate.typeName.type === AST_NODE_TYPES.Identifier &&
    candidate.typeArguments === undefined &&
    sourceCode
        .getDeclaredVariables(declaration)
        .some((variable) =>
            variable.references.some(
                (reference) => reference.identifier === candidate.typeName
            )
        );
