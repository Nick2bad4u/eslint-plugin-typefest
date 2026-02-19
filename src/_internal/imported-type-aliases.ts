/**
 * @packageDocumentation
 * Internal shared utilities used by eslint-plugin-typefest rule modules and plugin wiring.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

/**
 * Matched imported type alias that can be replaced with a canonical name.
 */
export type ImportedTypeAliasMatch = {
    importedName: string;
    replacementName: string;
    sourceValue: string;
};

/**
 * Collects imported canonical type alias names that should be replaced by
 * preferred type-fest utility names.
 *
 * @param sourceCode - Source code object for the current file.
 * @param replacementsByImportedName - Mapping from imported symbol names to
 *   preferred replacement names.
 *
 * @returns Map keyed by canonical imported alias name with replacement
 *   metadata.
 */
export const collectImportedTypeAliasMatches = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    replacementsByImportedName: Readonly<Record<string, string>>
): ReadonlyMap<string, ImportedTypeAliasMatch> => {
    const aliasMatches = new Map<string, ImportedTypeAliasMatch>();

    for (const statement of sourceCode.ast.body) {
        if (statement.type !== "ImportDeclaration") {
            continue;
        }

        const sourceValue =
            typeof statement.source.value === "string"
                ? statement.source.value
                : "";

        for (const specifier of statement.specifiers) {
            if (specifier.type !== "ImportSpecifier") {
                continue;
            }

            if (specifier.imported.type !== "Identifier") {
                continue;
            }

            if (specifier.local.name !== specifier.imported.name) {
                continue;
            }

            const replacementName =
                replacementsByImportedName[specifier.imported.name];
            if (!replacementName) {
                continue;
            }

            aliasMatches.set(specifier.imported.name, {
                importedName: specifier.imported.name,
                replacementName,
                sourceValue,
            });
        }
    }

    return aliasMatches;
};

/**
 * Collect direct (non-renamed) named imports for a specific source module.
 *
 * @param sourceCode - Source code object for the current file.
 * @param expectedSourceValue - Module source string to match.
 *
 * @returns Set of imported identifier names.
 */
export const collectDirectNamedImportsFromSource = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    expectedSourceValue: string
): ReadonlySet<string> => {
    const namedImports = new Set<string>();

    for (const statement of sourceCode.ast.body) {
        if (statement.type !== "ImportDeclaration") {
            continue;
        }

        if (statement.source.value !== expectedSourceValue) {
            continue;
        }

        for (const specifier of statement.specifiers) {
            if (specifier.type !== "ImportSpecifier") {
                continue;
            }

            if (specifier.imported.type !== "Identifier") {
                continue;
            }

            if (specifier.local.name !== specifier.imported.name) {
                continue;
            }

            namedImports.add(specifier.imported.name);
        }
    }

    return namedImports;
};

const getParentNode = (
    node: Readonly<TSESTree.Node>
): Readonly<TSESTree.Node> | undefined => {
    const nodeWithParent = node as Readonly<TSESTree.Node> & {
        parent?: Readonly<TSESTree.Node>;
    };

    return nodeWithParent.parent;
};

const ancestorDefinesTypeParameterNamed = (
    ancestor: Readonly<TSESTree.Node>,
    parameterName: string
): boolean => {
    const ancestorWithTypeParameters = ancestor as Readonly<TSESTree.Node> & {
        typeParameters?: Readonly<TSESTree.TSTypeParameterDeclaration>;
    };

    const typeParameterDeclaration = ancestorWithTypeParameters.typeParameters;
    if (!typeParameterDeclaration) {
        return false;
    }

    return typeParameterDeclaration.params.some(
        (parameter) => parameter.name.name === parameterName
    );
};

export const isTypeParameterNameShadowed = (
    node: Readonly<TSESTree.Node>,
    parameterName: string
): boolean => {
    let currentNode: Readonly<TSESTree.Node> | undefined = node;

    while (currentNode) {
        if (ancestorDefinesTypeParameterNamed(currentNode, parameterName)) {
            return true;
        }

        currentNode = getParentNode(currentNode);
    }

    return false;
};

/**
 * Build a safe type-reference replacement fixer.
 *
 * @param node - Type reference node to potentially fix.
 * @param replacementName - Replacement identifier text.
 * @param availableReplacementNames - Available direct imported replacement
 *   names.
 *
 * @returns Fix function when replacement is safe; otherwise `null`.
 */
export const createSafeTypeReferenceReplacementFix = (
    node: Readonly<TSESTree.TSTypeReference>,
    replacementName: string,
    availableReplacementNames: ReadonlySet<string>
): null | TSESLint.ReportFixFunction => {
    if (node.typeName.type !== "Identifier") {
        return null;
    }

    if (!availableReplacementNames.has(replacementName)) {
        return null;
    }

    if (isTypeParameterNameShadowed(node, replacementName)) {
        return null;
    }

    return (fixer) => fixer.replaceText(node.typeName, replacementName);
};
