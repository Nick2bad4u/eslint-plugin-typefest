/**
 * @packageDocumentation
 * Utilities for collecting and safely resolving direct named value imports.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import {
    collectNamedImportSpecifierBindingsFromSource,
    isImportDeclarationFromSource,
} from "./import-analysis.js";
import {
    type ImportFixIntent,
    shouldIncludeImportInsertionForReportFix,
} from "./import-fix-coordinator.js";
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
    reportFixIntent?: ImportFixIntent;
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
    reportFixIntent?: ImportFixIntent;
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
    reportFixIntent?: ImportFixIntent;
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
    reportFixIntent?: ImportFixIntent;
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
    reportFixIntent?: ImportFixIntent;
    sourceModuleName: string;
    targetNode: TSESTree.Node;
}>;

/**
 * Resolved import-planning metadata reused across value-fixer factories.
 */
type ValueReplacementPlan = Readonly<{
    replacementNameAndImportFixFactory: Readonly<{
        createImportFix: (
            fixer: Readonly<TSESLint.RuleFixer>
        ) => null | TSESLint.RuleFix;
        replacementName: string;
        requiresImportInsertion: boolean;
    }>;
    shouldIncludeImportInsertionFix: boolean;
}>;

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

    for (const binding of collectNamedImportSpecifierBindingsFromSource({
        allowTypeImportDeclaration: false,
        allowTypeImportSpecifier: false,
        sourceCode,
        sourceModuleName,
    })) {
        const existing = aliasesByImportedName.get(binding.importedName);
        if (existing === undefined) {
            aliasesByImportedName.set(
                binding.importedName,
                new Set([binding.localName])
            );
        } else {
            existing.add(binding.localName);
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
    shouldIncludeImportInsertionFix,
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
    shouldIncludeImportInsertionFix: boolean;
}>): null | readonly TSESLint.RuleFix[] => {
    const replacementFix = createReplacementFix(fixer);

    if (!replacementNameAndImportFixFactory.requiresImportInsertion) {
        return [replacementFix];
    }

    if (!shouldIncludeImportInsertionFix) {
        return [replacementFix];
    }

    const importFix = replacementNameAndImportFixFactory.createImportFix(fixer);
    if (importFix === null) {
        return null;
    }

    return [importFix, replacementFix];
};

/**
 * Resolve and coordinate import planning for value replacement fixers.
 */
const createValueReplacementPlan = ({
    context,
    importedName,
    imports,
    referenceNode,
    reportFixIntent,
    sourceModuleName,
}: Readonly<{
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    referenceNode: Readonly<TSESTree.Node>;
    reportFixIntent: ImportFixIntent;
    sourceModuleName: string;
}>): null | ValueReplacementPlan => {
    const replacementNameAndImportFixFactory =
        getSafeReplacementNameAndImportFixFactory({
            context,
            importedName,
            imports,
            referenceNode,
            sourceModuleName,
        });

    if (replacementNameAndImportFixFactory === null) {
        return null;
    }

    const shouldIncludeImportInsertionFix =
        replacementNameAndImportFixFactory.requiresImportInsertion
            ? shouldIncludeImportInsertionForReportFix({
                  importBindingKind: "value",
                  importedName,
                  referenceNode,
                  reportFixIntent,
                  sourceModuleName,
              })
            : false;

    return {
        replacementNameAndImportFixFactory,
        shouldIncludeImportInsertionFix,
    };
};

/**
 * Build a report-fix callback from a resolved value replacement plan.
 */
const createReportFixFromValueReplacementPlan =
    ({
        createReplacementFix,
        valueReplacementPlan,
    }: Readonly<{
        createReplacementFix: (
            fixer: Readonly<TSESLint.RuleFixer>,
            replacementName: string
        ) => TSESLint.RuleFix;
        valueReplacementPlan: Readonly<ValueReplacementPlan>;
    }>): TSESLint.ReportFixFunction =>
    (fixer) =>
        createImportAwareFixes({
            createReplacementFix: (replacementFixer) =>
                createReplacementFix(
                    replacementFixer,
                    valueReplacementPlan.replacementNameAndImportFixFactory
                        .replacementName
                ),
            fixer,
            replacementNameAndImportFixFactory:
                valueReplacementPlan.replacementNameAndImportFixFactory,
            shouldIncludeImportInsertionFix:
                valueReplacementPlan.shouldIncludeImportInsertionFix,
        });

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
    reportFixIntent = "autofix",
    sourceModuleName,
    targetNode,
}: Readonly<SafeValueReplacementFixParams>): null | TSESLint.ReportFixFunction => {
    const valueReplacementPlan = createValueReplacementPlan({
        context,
        importedName,
        imports,
        referenceNode: targetNode,
        reportFixIntent,
        sourceModuleName,
    });

    if (valueReplacementPlan === null) {
        return null;
    }

    return createReportFixFromValueReplacementPlan({
        createReplacementFix: (replacementFixer, replacementName) =>
            replacementFixer.replaceText(targetNode, replacementName),
        valueReplacementPlan,
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
    reportFixIntent = "autofix",
    sourceModuleName,
    targetNode,
}: Readonly<SafeValueNodeTextReplacementFixParams>): null | TSESLint.ReportFixFunction => {
    const valueReplacementPlan = createValueReplacementPlan({
        context,
        importedName,
        imports,
        referenceNode: targetNode,
        reportFixIntent,
        sourceModuleName,
    });

    if (valueReplacementPlan === null) {
        return null;
    }

    return createReportFixFromValueReplacementPlan({
        createReplacementFix: (replacementFixer, replacementName) =>
            replacementFixer.replaceText(
                targetNode,
                replacementTextFactory(replacementName)
            ),
        valueReplacementPlan,
    });
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
    reportFixIntent = "autofix",
    sourceModuleName,
}: Readonly<MethodToFunctionCallFixParams>): null | TSESLint.ReportFixFunction => {
    if (callNode.optional || callNode.callee.type !== "MemberExpression") {
        return null;
    }

    if (callNode.callee.optional) {
        return null;
    }

    const valueReplacementPlan = createValueReplacementPlan({
        context,
        importedName,
        imports,
        referenceNode: callNode,
        reportFixIntent,
        sourceModuleName,
    });

    if (valueReplacementPlan === null) {
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
            ? `${valueReplacementPlan.replacementNameAndImportFixFactory.replacementName}(${receiverText}, ${argumentText})`
            : `${valueReplacementPlan.replacementNameAndImportFixFactory.replacementName}(${receiverText})`;

    return createReportFixFromValueReplacementPlan({
        createReplacementFix: (replacementFixer) =>
            replacementFixer.replaceText(callNode, replacementText),
        valueReplacementPlan,
    });
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
    reportFixIntent = "autofix",
    sourceModuleName,
}: Readonly<MemberToFunctionCallFixParams>): null | TSESLint.ReportFixFunction => {
    if (memberNode.optional) {
        return null;
    }

    const valueReplacementPlan = createValueReplacementPlan({
        context,
        importedName,
        imports,
        referenceNode: memberNode,
        reportFixIntent,
        sourceModuleName,
    });

    if (valueReplacementPlan === null) {
        return null;
    }

    const receiverText = getFunctionCallArgumentText({
        argumentNode: memberNode.object,
        sourceCode: context.sourceCode,
    });
    if (receiverText === null) {
        return null;
    }

    const replacementText = `${valueReplacementPlan.replacementNameAndImportFixFactory.replacementName}(${receiverText})`;

    return createReportFixFromValueReplacementPlan({
        createReplacementFix: (replacementFixer) =>
            replacementFixer.replaceText(memberNode, replacementText),
        valueReplacementPlan,
    });
};

/**
 * Create a fixer that rewrites a target node to an imported helper invocation.
 *
 * @param options - Target/argument nodes and import metadata for call
 *
 * @returns A report fixer when safe; otherwise `null`.
 */
export const createSafeValueArgumentFunctionCallFix = ({
    argumentNode,
    context,
    importedName,
    imports,
    negated,
    reportFixIntent = "autofix",
    sourceModuleName,
    targetNode,
}: Readonly<ValueArgumentFunctionCallFixParams>): null | TSESLint.ReportFixFunction => {
    const valueReplacementPlan = createValueReplacementPlan({
        context,
        importedName,
        imports,
        referenceNode: targetNode,
        reportFixIntent,
        sourceModuleName,
    });

    if (valueReplacementPlan === null) {
        return null;
    }

    const argumentText = getFunctionCallArgumentText({
        argumentNode,
        sourceCode: context.sourceCode,
    });
    if (argumentText === null) {
        return null;
    }

    const callText = `${valueReplacementPlan.replacementNameAndImportFixFactory.replacementName}(${argumentText})`;
    const replacementText = negated === true ? `!${callText}` : callText;

    return createReportFixFromValueReplacementPlan({
        createReplacementFix: (replacementFixer) =>
            replacementFixer.replaceText(targetNode, replacementText),
        valueReplacementPlan,
    });
};
