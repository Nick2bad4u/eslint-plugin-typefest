/**
 * @packageDocumentation
 * Utilities for collecting and safely resolving direct named value imports.
 */
import { TSESLint, TSESTree } from "@typescript-eslint/utils";

/**
 * Immutable mapping of imported symbol names to directly imported local aliases.
 */
export type ImportedValueAliasMap = ReadonlyMap<string, ReadonlySet<string>>;

/**
 * Parameters for resolving a safe local alias for an imported value symbol.
 */
type SafeImportedValueNameParams = Readonly<{
    context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    referenceNode: TSESTree.Node;
    sourceModuleName: string;
}>;

/**
 * Parameters for creating a safe replacement fixer for a value reference.
 */
type SafeValueReplacementFixParams = Readonly<{
    context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    sourceModuleName: string;
    targetNode: TSESTree.Node;
}>;

/**
 * Parameters for creating a safe method-call to function-call fixer.
 */
type MethodToFunctionCallFixParams = Readonly<{
    callNode: TSESTree.CallExpression;
    context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    sourceModuleName: string;
}>;

/**
 * Parameters for creating a safe member-expression to function-call fixer.
 */
type MemberToFunctionCallFixParams = Readonly<{
    context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    memberNode: TSESTree.MemberExpression;
    sourceModuleName: string;
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
            if (existing !== undefined) {
                existing.add(localName);
            } else {
                aliasesByImportedName.set(importedName, new Set([localName]));
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

/**
 * Resolve a local alias that is safely bound to the expected import at a reference node.
 *
 * @returns local alias when safely resolved; otherwise `null`.
 */
export const getSafeLocalNameForImportedValue = ({
    context,
    importedName,
    imports,
    referenceNode,
    sourceModuleName,
}: SafeImportedValueNameParams): string | null => {
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

/**
 * Create a fixer that safely replaces a target node with a resolved local import alias.
 *
 * @returns a report fixer when safe; otherwise `null`.
 */
export const createSafeValueReferenceReplacementFix = ({
    context,
    importedName,
    imports,
    sourceModuleName,
    targetNode,
}: SafeValueReplacementFixParams): TSESLint.ReportFixFunction | null => {
    const replacementName = getSafeLocalNameForImportedValue({
        context,
        importedName,
        imports,
        referenceNode: targetNode,
        sourceModuleName,
    });

    if (!replacementName) {
        return null;
    }

    return fixer => fixer.replaceText(targetNode, replacementName);
};

/**
 * Create a fixer that rewrites `receiver.method(args...)` to `importedFn(receiver, args...)`.
 *
 * @returns a report fixer when safe; otherwise `null`.
 */
export const createMethodToFunctionCallFix = ({
    callNode,
    context,
    importedName,
    imports,
    sourceModuleName,
}: MethodToFunctionCallFixParams): TSESLint.ReportFixFunction | null => {
    if (callNode.optional === true || callNode.callee.type !== "MemberExpression") {
        return null;
    }

    if (callNode.callee.optional === true) {
        return null;
    }

    const replacementName = getSafeLocalNameForImportedValue({
        context,
        importedName,
        imports,
        referenceNode: callNode,
        sourceModuleName,
    });

    if (!replacementName) {
        return null;
    }

    const { sourceCode } = context;
    const receiverText = sourceCode.getText(callNode.callee.object);
    const argumentText = callNode.arguments
        .map(argument => sourceCode.getText(argument))
        .join(", ");

    const replacementText = argumentText.length > 0
        ? `${replacementName}(${receiverText}, ${argumentText})`
        : `${replacementName}(${receiverText})`;

    return fixer => fixer.replaceText(callNode, replacementText);
};

/**
 * Create a fixer that rewrites `receiver[member]` to `importedFn(receiver)`.
 *
 * @returns a report fixer when safe; otherwise `null`.
 */
export const createMemberToFunctionCallFix = ({
    context,
    importedName,
    imports,
    memberNode,
    sourceModuleName,
}: MemberToFunctionCallFixParams): TSESLint.ReportFixFunction | null => {
    if (memberNode.optional === true) {
        return null;
    }

    const replacementName = getSafeLocalNameForImportedValue({
        context,
        importedName,
        imports,
        referenceNode: memberNode,
        sourceModuleName,
    });

    if (!replacementName) {
        return null;
    }

    const receiverText = context.sourceCode.getText(memberNode.object);
    return fixer => fixer.replaceText(memberNode, `${replacementName}(${receiverText})`);
};

const isLocalNameBoundToExpectedImport = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    referenceNode: TSESTree.Node,
    localName: string,
    sourceModuleName: string
): boolean => {
    const initialScope = sourceCode.getScope(referenceNode);
    const variable = resolveVariableInScopeChain(initialScope, localName);

    if (!variable) {
        return false;
    }

    return variable.defs.some(definition => {
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
};

const resolveVariableInScopeChain = (
    scope: Readonly<TSESLint.Scope.Scope> | null,
    variableName: string
): TSESLint.Scope.Variable | null => {
    let currentScope = scope;

    while (currentScope !== null) {
        const variable = currentScope.set.get(variableName);
        if (variable !== undefined) {
            return variable;
        }

        currentScope = currentScope.upper;
    }

    return null;
};
