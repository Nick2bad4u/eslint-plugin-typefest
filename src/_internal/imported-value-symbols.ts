/**
 * @packageDocumentation
 * Utilities for collecting and safely resolving direct named value imports.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { createImportInsertionFix } from "./import-insertion.js";

/**
 * Immutable mapping of imported symbol names to directly imported local
 * aliases.
 */
type ImportedValueAliasMap = ReadonlyMap<string, ReadonlySet<string>>;

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
 * Collect direct named value imports from a specific module.
 *
 * @param sourceCode - Source code object for the current file.
 * @param sourceModuleName - Module source string to match.
 *
 * @returns Readonly map of imported symbol names to local aliases.
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

        if (!isImportDeclarationFromSource(node, sourceModuleName)) {
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

/**
 * Finds a variable binding by name starting at a scope and walking outward.
 *
 * @param scope - Initial scope for lookup.
 * @param variableName - Identifier name to resolve.
 *
 * @returns Matched variable binding from the nearest scope chain; otherwise
 *   `null`.
 */
function getVariableInScopeChain(
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

/**
 * Verify that a local identifier resolves to an import binding from the
 * expected module at a specific reference location.
 *
 * @param sourceCode - SourceCode instance for scope resolution.
 * @param referenceNode - AST node where the identifier will be referenced.
 * @param localName - Candidate local alias name.
 * @param sourceModuleName - Expected source module for the import binding.
 *
 * @returns `true` when the resolved local name is a matching import binding
 *   from the expected module.
 */
function isLocalNameBoundToExpectedImport(
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
            isImportDeclarationFromSource(parent, sourceModuleName)
        );
    });
}

/**
 * Determine whether using the direct imported symbol name is safe at a
 * reference node without colliding with non-import bindings.
 *
 * @param options - Resolution inputs used to test direct-name safety.
 *
 * @returns `true` when using the bare imported symbol name would resolve to the
 *   expected import binding at the reference location.
 */
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
            isImportDeclarationFromSource(parent, sourceModuleName) &&
            parent.importKind !== "type" &&
            definitionNode.importKind !== "type"
        );
    });
};

/**
 * Create a fixer that inserts a missing named value import for the target
 * module.
 *
 * @param options - Fixer context and import metadata.
 *
 * @returns Import insertion fix when a safe insertion point is found; otherwise
 *   `null`.
 */
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
    const importDeclarationText = `import { ${importedName} } from "${sourceModuleName}";`;

    return createImportInsertionFix({
        fixer,
        importDeclarationText,
        referenceNode,
    });
};

/**
 * Resolve a local alias that is safely bound to the expected import at a
 * reference node.
 *
 * @param options - Context and import metadata for local-name resolution.
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

/**
 * Resolve a safe replacement symbol and corresponding optional import-insert
 * factory for value replacements.
 *
 * @param options - Context and import metadata used to resolve a safe
 *   replacement name.
 *
 * @returns Replacement metadata with optional import-fix factory when safe;
 *   otherwise `null`.
 */
const getSafeReplacementNameAndImportFixFactory = ({
    context,
    importedName,
    imports,
    referenceNode,
    sourceModuleName,
}: Readonly<SafeImportedValueNameParams>): null | {
    createImportFix: (
        fixer: Readonly<TSESLint.RuleFixer>
    ) => null | TSESLint.RuleFix;
    replacementName: string;
    requiresImportInsertion: boolean;
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
            requiresImportInsertion: false,
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
        requiresImportInsertion: true,
    };
};

/**
 * Compose replacement and optional import insertion fixes into a single fix
 * array for `context.report` callbacks.
 *
 * @param options - Replacement-fix callback, fixer instance, and optional
 *   import-fix metadata.
 *
 * @returns Combined fix array when all required fixes are available; otherwise
 *   `null`.
 */
const createImportAwareFixes = ({
    createReplacementFix,
    fixer,
    replacementNameAndImportFixFactory,
}: Readonly<{
    createReplacementFix: (
        fixer: Readonly<TSESLint.RuleFixer>
    ) => TSESLint.RuleFix;
    fixer: Readonly<TSESLint.RuleFixer>;
    replacementNameAndImportFixFactory: Readonly<{
        createImportFix: (
            fixer: Readonly<TSESLint.RuleFixer>
        ) => null | TSESLint.RuleFix;
        requiresImportInsertion: boolean;
    }>;
}>): null | readonly TSESLint.RuleFix[] => {
    const importFix = replacementNameAndImportFixFactory.createImportFix(fixer);
    if (
        importFix === null &&
        replacementNameAndImportFixFactory.requiresImportInsertion
    ) {
        return null;
    }

    const replacementFix = createReplacementFix(fixer);

    return importFix ? [importFix, replacementFix] : [replacementFix];
};

/**
 * Serialize a call argument node to text, preserving sequence-expression
 * semantics with parentheses when required.
 *
 * @param options - Argument node and source-code accessor.
 *
 * @returns Trimmed argument text suitable for function-call insertion, or
 *   `null` when no text can be produced.
 */
const getFunctionCallArgumentText = ({
    argumentNode,
    sourceCode,
}: Readonly<{
    argumentNode: Readonly<TSESTree.Node>;
    sourceCode: Readonly<TSESLint.SourceCode>;
}>): null | string => {
    const argumentText = sourceCode.getText(argumentNode).trim();
    if (argumentText.length === 0) {
        return null;
    }

    if (argumentNode.type !== "SequenceExpression") {
        return argumentText;
    }

    if (argumentText.startsWith("(") && argumentText.endsWith(")")) {
        return argumentText;
    }

    return `(${argumentText})`;
};

/**
 * Create a fixer that safely replaces a target node with a resolved local
 * import alias.
 *
 * @param options - Inputs used to resolve replacement/import insertion safety.
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

    return (fixer) =>
        createImportAwareFixes({
            createReplacementFix: (replacementFixer) =>
                replacementFixer.replaceText(
                    targetNode,
                    replacementNameAndImportFixFactory.replacementName
                ),
            fixer,
            replacementNameAndImportFixFactory,
        });
};

/**
 * Create a fixer that safely rewrites a target node using custom replacement
 * text derived from a resolved helper local name.
 *
 * @param options - Inputs for safe helper-name resolution and replacement-text
 *   generation.
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

        return createImportAwareFixes({
            createReplacementFix: (replacementFixer) =>
                replacementFixer.replaceText(targetNode, replacementText),
            fixer,
            replacementNameAndImportFixFactory,
        });
    };
};

/**
 * Create a fixer that rewrites `receiver.method(args...)` to
 * `importedFn(receiver, args...)`.
 *
 * @param options - Call-expression context and import metadata.
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
    const receiverText = getFunctionCallArgumentText({
        argumentNode: callNode.callee.object,
        sourceCode,
    });
    if (receiverText === null) {
        return null;
    }

    const argumentTexts: string[] = [];

    for (const argument of callNode.arguments) {
        const argumentText = getFunctionCallArgumentText({
            argumentNode: argument,
            sourceCode,
        });

        if (argumentText === null) {
            return null;
        }

        argumentTexts.push(argumentText);
    }

    const argumentText = argumentTexts.join(", ");

    const replacementText =
        argumentText.length > 0
            ? `${replacementNameAndImportFixFactory.replacementName}(${receiverText}, ${argumentText})`
            : `${replacementNameAndImportFixFactory.replacementName}(${receiverText})`;

    return (fixer) =>
        createImportAwareFixes({
            createReplacementFix: (replacementFixer) =>
                replacementFixer.replaceText(callNode, replacementText),
            fixer,
            replacementNameAndImportFixFactory,
        });
};

/**
 * Create a fixer that rewrites `receiver[member]` to `importedFn(receiver)`.
 *
 * @param options - Member-expression context and import metadata.
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

    const receiverText = getFunctionCallArgumentText({
        argumentNode: memberNode.object,
        sourceCode: context.sourceCode,
    });
    if (receiverText === null) {
        return null;
    }

    const replacementText = `${replacementNameAndImportFixFactory.replacementName}(${receiverText})`;

    return (fixer) =>
        createImportAwareFixes({
            createReplacementFix: (replacementFixer) =>
                replacementFixer.replaceText(memberNode, replacementText),
            fixer,
            replacementNameAndImportFixFactory,
        });
};

/**
 * Create a fixer that rewrites a target node to an imported helper invocation.
 *
 * @param options - Target/argument nodes and import metadata for call
 *   replacement.
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

    const argumentText = getFunctionCallArgumentText({
        argumentNode,
        sourceCode: context.sourceCode,
    });
    if (argumentText === null) {
        return null;
    }

    const callText = `${replacementNameAndImportFixFactory.replacementName}(${argumentText})`;
    const replacementText = negated === true ? `!${callText}` : callText;

    return (fixer) =>
        createImportAwareFixes({
            createReplacementFix: (replacementFixer) =>
                replacementFixer.replaceText(targetNode, replacementText),
            fixer,
            replacementNameAndImportFixFactory,
        });
};
