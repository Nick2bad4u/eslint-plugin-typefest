/**
 * @packageDocumentation
 * Utilities for collecting and safely resolving direct named value imports.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * Immutable mapping of imported symbol names to directly imported local
 * aliases.
 */
export type ImportedValueAliasMap = ReadonlyMap<string, ReadonlySet<string>>;

/**
 * Parameters for creating a safe member-expression to function-call fixer.
 */
type MemberToFunctionCallFixParams = Readonly<{
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    memberNode: TSESTree.MemberExpression;
    sourceModuleName: string;
}>;

/**
 * Parameters for creating a safe method-call to function-call fixer.
 */
type MethodToFunctionCallFixParams = Readonly<{
    callNode: TSESTree.CallExpression;
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    sourceModuleName: string;
}>;

/**
 * Parameters for resolving a safe local alias for an imported value symbol.
 */
type SafeImportedValueNameParams = Readonly<{
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    referenceNode: TSESTree.Node;
    sourceModuleName: string;
}>;

/**
 * Parameters for creating a safe replacement fixer with custom replacement text
 * derived from the resolved helper local name.
 */
type SafeValueNodeTextReplacementFixParams = Readonly<{
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    replacementTextFactory: (replacementName: string) => string;
    sourceModuleName: string;
    targetNode: TSESTree.Node;
}>;

/**
 * Parameters for creating a safe replacement fixer for a value reference.
 */
type SafeValueReplacementFixParams = Readonly<{
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    sourceModuleName: string;
    targetNode: TSESTree.Node;
}>;

/**
 * Parameters for creating a safe function-call replacement fixer.
 */
type ValueArgumentFunctionCallFixParams = Readonly<{
    argumentNode: TSESTree.Node;
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    negated?: boolean;
    sourceModuleName: string;
    targetNode: TSESTree.Node;
}>;

/**
 * Collect direct named value imports from a specific module.
 *
 * @remarks
 * - Includes aliased imports (`{ foo as bar }`).
 * - Excludes type-only imports.
 */
export const collectDirectNamedValueImportsFromSource = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    sourceModuleName: string
): ImportedValueAliasMap => {
    const aliasesByImportedName = new Map<string, Set<string>>();

    for (const node of sourceCode.ast.body) {
        if (node.type !== "ImportDeclaration") {
            continue;
        }

        if (node.importKind === "type") {
            continue;
        }

        if (node.source.value !== sourceModuleName) {
            continue;
        }

        for (const specifier of node.specifiers) {
            if (specifier.type !== "ImportSpecifier") {
                continue;
            }

            if (specifier.importKind === "type") {
                continue;
            }

            if (
                specifier.imported.type !== "Identifier" ||
                specifier.local.type !== "Identifier"
            ) {
                continue;
            }

            const importedName = specifier.imported.name;
            const localName = specifier.local.name;

            const existing = aliasesByImportedName.get(importedName);
            if (existing === undefined) {
                aliasesByImportedName.set(importedName, new Set([localName]));
            } else {
                existing.add(localName);
            }
        }
    }

    return new Map(
        [...aliasesByImportedName.entries()].map(([importedName, aliases]) => [
            importedName,
            new Set(aliases),
        ])
    );
};

function getVariableInScopeChain (
    scope: Readonly<null | Readonly<TSESLint.Scope.Scope>>,
    variableName: string
): null | TSESLint.Scope.Variable {
    let currentScope = scope;

    while (currentScope !== null) {
        const variable = currentScope.set.get(variableName);
        if (variable !== undefined) {
            return variable;
        }

        currentScope = currentScope.upper;
    }

    return null;
}

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

    while (currentNode !== null) {
        if (currentNode.type === "Program") {
            return currentNode;
        }

        currentNode = getParentNode(currentNode) ?? null;
    }

    return null;
};

function isLocalNameBoundToExpectedImport (
    sourceCode: Readonly<TSESLint.SourceCode>,
    referenceNode: Readonly<TSESTree.Node>,
    localName: string,
    sourceModuleName: string
): boolean {
    const initialScope = sourceCode.getScope(referenceNode);
    const variable = getVariableInScopeChain(initialScope, localName);

    if (!variable) {
        return false;
    }

    return variable.defs.some((definition) => {
        if (definition.type !== "ImportBinding") {
            return false;
        }

        const definitionNode = definition.node;
        if (definitionNode.type !== "ImportSpecifier") {
            return false;
        }

        const parent = definitionNode.parent;
        return (
            parent.type === "ImportDeclaration" &&
            parent.source.value === sourceModuleName
        );
    });
}

const canUseDirectImportedNameSafely = ({
    context,
    importedName,
    referenceNode,
    sourceModuleName,
}: Readonly<{
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    referenceNode: TSESTree.Node;
    sourceModuleName: string;
}>): boolean => {
    const initialScope = context.sourceCode.getScope(referenceNode);
    const variable = getVariableInScopeChain(initialScope, importedName);

    if (!variable) {
        return true;
    }

    return variable.defs.some((definition) => {
        if (definition.type !== "ImportBinding") {
            return false;
        }

        const definitionNode = definition.node;
        if (definitionNode.type !== "ImportSpecifier") {
            return false;
        }

        if (definitionNode.local.name !== importedName) {
            return false;
        }

        const parent = definitionNode.parent;

        return (
            parent.type === "ImportDeclaration" &&
            parent.source.value === sourceModuleName &&
            parent.importKind !== "type" &&
            definitionNode.importKind !== "type"
        );
    });
};

const createInsertNamedValueImportFix = ({
    fixer,
    importedName,
    referenceNode,
    sourceModuleName,
}: Readonly<{
    fixer: TSESLint.RuleFixer;
    importedName: string;
    referenceNode: TSESTree.Node;
    sourceModuleName: string;
}>): null | TSESLint.RuleFix => {
    const programNode = getProgramNode(referenceNode);
    if (!programNode) {
        return null;
    }

    const importDeclarationText = `import { ${importedName} } from "${sourceModuleName}";`;

    const importDeclarations: TSESTree.ImportDeclaration[] = [];
    for (const statement of programNode.body) {
        if (statement.type === "ImportDeclaration") {
            importDeclarations.push(statement);
        }
    }

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

/**
 * Resolve a local alias that is safely bound to the expected import at a
 * reference node.
 *
 * @returns Local alias when safely resolved; otherwise `null`.
 */
export const getSafeLocalNameForImportedValue = ({
    context,
    importedName,
    imports,
    referenceNode,
    sourceModuleName,
}: Readonly<SafeImportedValueNameParams>): null | string => {
    const candidateNames = imports.get(importedName);
    if (!candidateNames || candidateNames.size === 0) {
        return null;
    }

    for (const candidateName of candidateNames) {
        if (
            isLocalNameBoundToExpectedImport(
                context.sourceCode,
                referenceNode,
                candidateName,
                sourceModuleName
            )
        ) {
            return candidateName;
        }
    }

    return null;
};

const getSafeReplacementNameAndImportFixFactory = ({
    context,
    importedName,
    imports,
    referenceNode,
    sourceModuleName,
}: Readonly<SafeImportedValueNameParams>): null | {
    createImportFix: (fixer: Readonly<TSESLint.RuleFixer>) => null | TSESLint.RuleFix;
    replacementName: string;
} => {
    const existingReplacementName = getSafeLocalNameForImportedValue({
        context,
        importedName,
        imports,
        referenceNode,
        sourceModuleName,
    });

    if (
        typeof existingReplacementName === "string" &&
        existingReplacementName.length > 0
    ) {
        return {
            createImportFix: () => null,
            replacementName: existingReplacementName,
        };
    }

    if (
        !canUseDirectImportedNameSafely({
            context,
            importedName,
            referenceNode,
            sourceModuleName,
        })
    ) {
        return null;
    }

    return {
        createImportFix: (fixer) =>
            createInsertNamedValueImportFix({
                fixer,
                importedName,
                referenceNode,
                sourceModuleName,
            }),
        replacementName: importedName,
    };
};

/**
 * Create a fixer that safely replaces a target node with a resolved local
 * import alias.
 *
 * @returns A report fixer when safe; otherwise `null`.
 */
export const createSafeValueReferenceReplacementFix = ({
    context,
    importedName,
    imports,
    sourceModuleName,
    targetNode,
}: Readonly<SafeValueReplacementFixParams>): null | TSESLint.ReportFixFunction => {
    const replacementNameAndImportFixFactory =
        getSafeReplacementNameAndImportFixFactory({
            context,
            importedName,
            imports,
            referenceNode: targetNode,
            sourceModuleName,
        });

    if (!replacementNameAndImportFixFactory) {
        return null;
    }

    return (fixer) => {
        const importFix =
            replacementNameAndImportFixFactory.createImportFix(fixer);
        const replacementFix = fixer.replaceText(
            targetNode,
            replacementNameAndImportFixFactory.replacementName
        );

        return importFix ? [importFix, replacementFix] : [replacementFix];
    };
};

/**
 * Create a fixer that safely rewrites a target node using custom replacement
 * text derived from a resolved helper local name.
 *
 * @returns A report fixer when safe; otherwise `null`.
 */
export const createSafeValueNodeTextReplacementFix = ({
    context,
    importedName,
    imports,
    replacementTextFactory,
    sourceModuleName,
    targetNode,
}: Readonly<SafeValueNodeTextReplacementFixParams>): null | TSESLint.ReportFixFunction => {
    const replacementNameAndImportFixFactory =
        getSafeReplacementNameAndImportFixFactory({
            context,
            importedName,
            imports,
            referenceNode: targetNode,
            sourceModuleName,
        });

    if (!replacementNameAndImportFixFactory) {
        return null;
    }

    return (fixer) => {
        const replacementText = replacementTextFactory(
            replacementNameAndImportFixFactory.replacementName
        );
        const importFix =
            replacementNameAndImportFixFactory.createImportFix(fixer);
        const replacementFix = fixer.replaceText(targetNode, replacementText);

        return importFix ? [importFix, replacementFix] : [replacementFix];
    };
};

/**
 * Create a fixer that rewrites `receiver.method(args...)` to
 * `importedFn(receiver, args...)`.
 *
 * @returns A report fixer when safe; otherwise `null`.
 */
export const createMethodToFunctionCallFix = ({
    callNode,
    context,
    importedName,
    imports,
    sourceModuleName,
}: Readonly<MethodToFunctionCallFixParams>): null | TSESLint.ReportFixFunction => {
    if (callNode.optional || callNode.callee.type !== "MemberExpression") {
        return null;
    }

    if (callNode.callee.optional) {
        return null;
    }

    const replacementNameAndImportFixFactory =
        getSafeReplacementNameAndImportFixFactory({
            context,
            importedName,
            imports,
            referenceNode: callNode,
            sourceModuleName,
        });

    if (!replacementNameAndImportFixFactory) {
        return null;
    }

    const { sourceCode } = context;
    const receiverText = sourceCode.getText(callNode.callee.object);
    const argumentText = callNode.arguments
        .map((argument) => sourceCode.getText(argument))
        .join(", ");

    const replacementText =
        argumentText.length > 0
            ? `${replacementNameAndImportFixFactory.replacementName}(${receiverText}, ${argumentText})`
            : `${replacementNameAndImportFixFactory.replacementName}(${receiverText})`;

    return (fixer) => {
        const importFix =
            replacementNameAndImportFixFactory.createImportFix(fixer);
        const replacementFix = fixer.replaceText(callNode, replacementText);

        return importFix ? [importFix, replacementFix] : [replacementFix];
    };
};

/**
 * Create a fixer that rewrites `receiver[member]` to `importedFn(receiver)`.
 *
 * @returns A report fixer when safe; otherwise `null`.
 */
export const createMemberToFunctionCallFix = ({
    context,
    importedName,
    imports,
    memberNode,
    sourceModuleName,
}: Readonly<MemberToFunctionCallFixParams>): null | TSESLint.ReportFixFunction => {
    if (memberNode.optional) {
        return null;
    }

    const replacementNameAndImportFixFactory =
        getSafeReplacementNameAndImportFixFactory({
            context,
            importedName,
            imports,
            referenceNode: memberNode,
            sourceModuleName,
        });

    if (!replacementNameAndImportFixFactory) {
        return null;
    }

    const receiverText = context.sourceCode.getText(memberNode.object);
    const replacementText = `${replacementNameAndImportFixFactory.replacementName}(${receiverText})`;

    return (fixer) => {
        const importFix =
            replacementNameAndImportFixFactory.createImportFix(fixer);
        const replacementFix = fixer.replaceText(memberNode, replacementText);

        return importFix ? [importFix, replacementFix] : [replacementFix];
    };
};

/**
 * Create a fixer that rewrites a target node to an imported helper invocation.
 *
 * @returns A report fixer when safe; otherwise `null`.
 */
export const createSafeValueArgumentFunctionCallFix = ({
    argumentNode,
    context,
    importedName,
    imports,
    negated,
    sourceModuleName,
    targetNode,
}: Readonly<ValueArgumentFunctionCallFixParams>): null | TSESLint.ReportFixFunction => {
    const replacementNameAndImportFixFactory =
        getSafeReplacementNameAndImportFixFactory({
            context,
            importedName,
            imports,
            referenceNode: targetNode,
            sourceModuleName,
        });

    if (!replacementNameAndImportFixFactory) {
        return null;
    }

    const argumentText = context.sourceCode.getText(argumentNode).trim();
    if (argumentText.length === 0) {
        return null;
    }

    const callText = `${replacementNameAndImportFixFactory.replacementName}(${argumentText})`;
    const replacementText = negated === true ? `!${callText}` : callText;

    return (fixer) => {
        const importFix =
            replacementNameAndImportFixFactory.createImportFix(fixer);
        const replacementFix = fixer.replaceText(targetNode, replacementText);

        return importFix ? [importFix, replacementFix] : [replacementFix];
    };
};
