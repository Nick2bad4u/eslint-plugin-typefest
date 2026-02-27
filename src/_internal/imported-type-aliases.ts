/**
 * @packageDocumentation
 * Internal shared utilities used by eslint-plugin-typefest rule modules and plugin wiring.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { getParentNode } from "./ast-node.js";
import { createImportInsertionFix } from "./import-insertion.js";

const TYPE_FEST_MODULE_NAME = "type-fest";
const READONLY_UTILITY_TYPE_NAME = "Readonly";

const READONLY_CONTAINER_TYPE_NAMES = new Set([
    "ReadonlyArray",
    "ReadonlyMap",
    "ReadonlySet",
]);

/**
 * Check whether an import declaration targets the expected source module.
 *
 * @param statement - Import declaration node.
 * @param sourceModuleName - Expected module specifier value.
 *
 * @returns `true` when the import declaration source matches.
 */
const isImportDeclarationFromSource = (
    statement: Readonly<TSESTree.ImportDeclaration>,
    sourceModuleName: string
): boolean => statement.source.value === sourceModuleName;

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
            if (
                typeof replacementName !== "string" ||
                replacementName.length === 0
            ) {
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

        if (!isImportDeclarationFromSource(statement, expectedSourceValue)) {
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

/**
 * Collect local identifier names for a specific named import from a selected
 * module source.
 *
 * @param sourceCode - Source code object for the current file.
 * @param expectedSourceValue - Module source string to match.
 * @param expectedImportedName - Imported symbol name to match.
 *
 * @returns Set of local identifier names (including aliased locals).
 */
export const collectNamedImportLocalNamesFromSource = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    expectedSourceValue: string,
    expectedImportedName: string
): ReadonlySet<string> => {
    const localNames = new Set<string>();

    for (const statement of sourceCode.ast.body) {
        if (statement.type !== "ImportDeclaration") {
            continue;
        }

        if (!isImportDeclarationFromSource(statement, expectedSourceValue)) {
            continue;
        }

        for (const specifier of statement.specifiers) {
            if (specifier.type !== "ImportSpecifier") {
                continue;
            }

            if (
                specifier.imported.type !== "Identifier" ||
                specifier.imported.name !== expectedImportedName
            ) {
                continue;
            }

            localNames.add(specifier.local.name);
        }
    }

    return localNames;
};

/**
 * Collect local identifier names for namespace imports from a selected module
 * source.
 *
 * @param sourceCode - Source code object for the current file.
 * @param expectedSourceValue - Module source string to match.
 *
 * @returns Set of namespace import local names.
 */
export const collectNamespaceImportLocalNamesFromSource = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    expectedSourceValue: string
): ReadonlySet<string> => {
    const localNames = new Set<string>();

    for (const statement of sourceCode.ast.body) {
        if (statement.type !== "ImportDeclaration") {
            continue;
        }

        if (!isImportDeclarationFromSource(statement, expectedSourceValue)) {
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

const getInsertionFixForMissingNamedTypeImport = ({
    fixer,
    node,
    replacementName,
    sourceModuleName,
}: Readonly<{
    fixer: TSESLint.RuleFixer;
    node: Readonly<TSESTree.Node>;
    replacementName: string;
    sourceModuleName: string;
}>): null | TSESLint.RuleFix => {
    const importDeclarationText = `import type { ${replacementName} } from "${sourceModuleName}";`;

    return createImportInsertionFix({
        fixer,
        importDeclarationText,
        referenceNode: node,
    });
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

export function isTypeParameterNameShadowed(
    node: Readonly<TSESTree.Node>,
    parameterName: string
): boolean {
    let currentNode: Readonly<TSESTree.Node> | undefined = node;

    while (currentNode) {
        if (ancestorDefinesTypeParameterNamed(currentNode, parameterName)) {
            return true;
        }

        currentNode = getParentNode(currentNode);
    }

    return false;
}

const createTypeReplacementFix = ({
    applyReplacement,
    availableReplacementNames,
    node,
    replacementName,
    sourceModuleName,
}: Readonly<{
    applyReplacement: (fixer: Readonly<TSESLint.RuleFixer>) => TSESLint.RuleFix;
    availableReplacementNames: ReadonlySet<string>;
    node: Readonly<TSESTree.Node>;
    replacementName: string;
    sourceModuleName: string;
}>): null | TSESLint.ReportFixFunction => {
    if (isTypeParameterNameShadowed(node, replacementName)) {
        return null;
    }

    if (availableReplacementNames.has(replacementName)) {
        return (fixer) => applyReplacement(fixer);
    }

    return (fixer) => {
        const importFix = getInsertionFixForMissingNamedTypeImport({
            fixer,
            node,
            replacementName,
            sourceModuleName,
        });

        if (!importFix) {
            return null;
        }

        const replacementFix = applyReplacement(fixer);

        return [importFix, replacementFix];
    };
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
    availableReplacementNames: Readonly<ReadonlySet<string>>,
    sourceModuleName: string = TYPE_FEST_MODULE_NAME
): null | TSESLint.ReportFixFunction => {
    if (node.typeName.type !== "Identifier") {
        return null;
    }

    return createTypeReplacementFix({
        applyReplacement: (fixer) =>
            fixer.replaceText(node.typeName, replacementName),
        availableReplacementNames,
        node,
        replacementName,
        sourceModuleName,
    });
};

/**
 * Build a safe whole-type-node replacement fixer with custom replacement text.
 *
 * @param node - Type node to potentially replace.
 * @param replacementName - Replacement symbol name used for import/scope safety
 *   checks.
 * @param replacementText - Final replacement text to emit.
 * @param availableReplacementNames - Available direct imported replacement
 *   names.
 *
 * @returns Fix function when replacement is safe; otherwise `null`.
 */
export const createSafeTypeNodeTextReplacementFix = (
    node: Readonly<TSESTree.Node>,
    replacementName: string,
    replacementText: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>,
    sourceModuleName: string = TYPE_FEST_MODULE_NAME
): null | TSESLint.ReportFixFunction =>
    createTypeReplacementFix({
        applyReplacement: (fixer) => fixer.replaceText(node, replacementText),
        availableReplacementNames,
        node,
        replacementName,
        sourceModuleName,
    });

/**
 * Build a safe whole-type-node replacement fixer.
 *
 * @param node - Type node to potentially replace.
 * @param replacementName - Replacement identifier text.
 * @param availableReplacementNames - Available direct imported replacement
 *   names.
 *
 * @returns Fix function when replacement is safe; otherwise `null`.
 */
export const createSafeTypeNodeReplacementFix = (
    node: Readonly<TSESTree.Node>,
    replacementName: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>,
    sourceModuleName: string = TYPE_FEST_MODULE_NAME
): null | TSESLint.ReportFixFunction =>
    createSafeTypeNodeTextReplacementFix(
        node,
        replacementName,
        replacementName,
        availableReplacementNames,
        sourceModuleName
    );

const isExplicitReadonlyTypeNode = (node: Readonly<TSESTree.Node>): boolean => {
    if (node.type === "TSTypeOperator") {
        return node.operator === "readonly";
    }

    if (
        node.type !== "TSTypeReference" ||
        node.typeName.type !== "Identifier"
    ) {
        return false;
    }

    return READONLY_CONTAINER_TYPE_NAMES.has(node.typeName.name);
};

const isReadonlyUtilityWrappedText = (replacementText: string): boolean =>
    /^\s*Readonly\s*</u.test(replacementText);

const toReadonlyUtilityWrappedText = (replacementText: string): string =>
    `${READONLY_UTILITY_TYPE_NAME}<${replacementText}>`;

/**
 * Build a safe whole-type-node replacement fixer that preserves explicit
 * readonly wrappers/operators from the original node.
 *
 * @param node - Type node to potentially replace.
 * @param replacementName - Replacement symbol name used for import/scope safety
 *   checks.
 * @param replacementText - Final replacement text before readonly-preservation
 *   adjustment.
 * @param availableReplacementNames - Available direct imported replacement
 *   names.
 *
 * @returns Fix function when replacement is safe; otherwise `null`.
 */
export const createSafeTypeNodeTextReplacementFixPreservingReadonly = (
    node: Readonly<TSESTree.Node>,
    replacementName: string,
    replacementText: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>,
    sourceModuleName: string = TYPE_FEST_MODULE_NAME
): null | TSESLint.ReportFixFunction => {
    const replacementTextWithReadonlyPreservation =
        isExplicitReadonlyTypeNode(node) &&
        !isReadonlyUtilityWrappedText(replacementText)
            ? toReadonlyUtilityWrappedText(replacementText)
            : replacementText;

    return createSafeTypeNodeTextReplacementFix(
        node,
        replacementName,
        replacementTextWithReadonlyPreservation,
        availableReplacementNames,
        sourceModuleName
    );
};

/**
 * Build a safe whole-type-node replacement fixer that preserves explicit
 * readonly wrappers/operators from the original node.
 *
 * @param node - Type node to potentially replace.
 * @param replacementName - Replacement identifier text.
 * @param availableReplacementNames - Available direct imported replacement
 *   names.
 *
 * @returns Fix function when replacement is safe; otherwise `null`.
 */
export const createSafeTypeNodeReplacementFixPreservingReadonly = (
    node: Readonly<TSESTree.Node>,
    replacementName: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>,
    sourceModuleName: string = TYPE_FEST_MODULE_NAME
): null | TSESLint.ReportFixFunction =>
    createSafeTypeNodeTextReplacementFixPreservingReadonly(
        node,
        replacementName,
        replacementName,
        availableReplacementNames,
        sourceModuleName
    );
