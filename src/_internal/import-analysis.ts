/**
 * @packageDocumentation
 * Shared import-declaration analysis utilities for rule internals.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

/**
 * Flattened named-import binding metadata.
 */
export type NamedImportSpecifierBinding = Readonly<{
    declaration: Readonly<TSESTree.ImportDeclaration>;
    importedName: string;
    localName: string;
    specifier: Readonly<TSESTree.ImportSpecifier>;
}>;

/**
 * Check whether an import declaration points at a specific source module.
 */
export const isImportDeclarationFromSource = (
    declaration: Readonly<TSESTree.ImportDeclaration>,
    sourceModuleName: string
): boolean => declaration.source.value === sourceModuleName;

/**
 * Collect named import-specifier bindings from one module source.
 */
export const collectNamedImportSpecifierBindingsFromSource = ({
    allowTypeImportDeclaration = true,
    allowTypeImportSpecifier = true,
    sourceCode,
    sourceModuleName,
}: Readonly<{
    allowTypeImportDeclaration?: boolean;
    allowTypeImportSpecifier?: boolean;
    sourceCode: Readonly<TSESLint.SourceCode>;
    sourceModuleName?: string;
}>): readonly NamedImportSpecifierBinding[] => {
    const bindings: NamedImportSpecifierBinding[] = [];

    for (const statement of sourceCode.ast.body) {
        if (statement.type !== "ImportDeclaration") {
            continue;
        }

        if (
            sourceModuleName !== undefined &&
            !isImportDeclarationFromSource(statement, sourceModuleName)
        ) {
            continue;
        }

        if (!allowTypeImportDeclaration && statement.importKind === "type") {
            continue;
        }

        for (const specifier of statement.specifiers) {
            if (specifier.type !== "ImportSpecifier") {
                continue;
            }

            if (!allowTypeImportSpecifier && specifier.importKind === "type") {
                continue;
            }

            if (
                specifier.imported.type !== "Identifier" ||
                specifier.local.type !== "Identifier"
            ) {
                continue;
            }

            bindings.push({
                declaration: statement,
                importedName: specifier.imported.name,
                localName: specifier.local.name,
                specifier,
            });
        }
    }

    return bindings;
};

/**
 * Collect namespace-import local names from one module source.
 */
export const collectNamespaceImportLocalNamesFromSourceModule = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    sourceModuleName: string
): ReadonlySet<string> => {
    const localNames = new Set<string>();

    for (const statement of sourceCode.ast.body) {
        if (statement.type !== "ImportDeclaration") {
            continue;
        }

        if (!isImportDeclarationFromSource(statement, sourceModuleName)) {
            continue;
        }

        for (const specifier of statement.specifiers) {
            if (specifier.type !== "ImportNamespaceSpecifier") {
                continue;
            }

            localNames.add(specifier.local.name);
        }
    }

    return localNames;
};
