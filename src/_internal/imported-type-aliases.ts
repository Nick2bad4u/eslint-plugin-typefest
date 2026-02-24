/**
 * @packageDocumentation
 * Internal shared utilities used by eslint-plugin-typefest rule modules and plugin wiring.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

const TYPE_FEST_MODULE_NAME = "type-fest";

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

const getProgramNode = (
    node: Readonly<TSESTree.Node>
): null | Readonly<TSESTree.Program> => {
    let currentNode: null | Readonly<TSESTree.Node> = node;

    while (currentNode) {
        if (currentNode.type === "Program") {
            return currentNode;
        }

        currentNode = getParentNode(currentNode) ?? null;
    }

    return null;
};

const collectProgramImportDeclarations = (
    programNode: Readonly<TSESTree.Program>
): readonly Readonly<TSESTree.ImportDeclaration>[] => {
    const importDeclarations: TSESTree.ImportDeclaration[] = [];

    for (const statement of programNode.body) {
        if (statement.type === "ImportDeclaration") {
            importDeclarations.push(statement);
        }
    }

    return importDeclarations;
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
    const programNode = getProgramNode(node);
    if (!programNode) {
        return null;
    }

    const importDeclarationText = `import type { ${replacementName} } from "${sourceModuleName}";`;

    const importDeclarations = collectProgramImportDeclarations(programNode);

    const lastImportDeclaration = importDeclarations.at(-1);
    if (lastImportDeclaration) {
        return fixer.insertTextAfter(
            lastImportDeclaration,
            `\n${importDeclarationText}`
        );
    }

    const [programStart] = programNode.range;
    return fixer.insertTextBeforeRange(
        [programStart, programStart],
        `${importDeclarationText}\n`
    );
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

export function isTypeParameterNameShadowed (
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
}>
): null | TSESLint.ReportFixFunction => {
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

        const replacementFix = applyReplacement(fixer);

        return importFix ? [importFix, replacementFix] : [replacementFix];
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
    createTypeReplacementFix({
        applyReplacement: (fixer) => fixer.replaceText(node, replacementName),
        availableReplacementNames,
        node,
        replacementName,
        sourceModuleName,
    });

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
