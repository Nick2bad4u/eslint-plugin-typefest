/**
 * @packageDocumentation
 * Shared utilities for safely inserting import declarations in fixer output.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { arrayAt, isInteger } from "ts-extras";

import { getProgramNode } from "./ast-node.js";
import { isImportInsertionFixesDisabledForNode } from "./plugin-settings.js";
import {
    isAsciiIdentifierPartCharacter,
    isKnownWhitespaceCharacter,
} from "./text-character.js";

/**
 * Cached insertion-layout metadata for one Program node.
 */
type ProgramInsertionLayout = Readonly<{
    firstRelativeImportDeclaration: null | Readonly<TSESTree.ImportDeclaration>;
    firstStatementStart: null | number;
    importDeclarations: readonly Readonly<TSESTree.ImportDeclaration>[];
    lastDirectiveStatement: null | Readonly<TSESTree.ExpressionStatement>;
    lastImportDeclaration: null | Readonly<TSESTree.ImportDeclaration>;
    lastNonRelativeImportDeclaration: null | Readonly<TSESTree.ImportDeclaration>;
    programEnd: null | number;
}>;

/**
 * Program-scoped insertion-layout cache reused across repeated fixer planning.
 */
const programInsertionLayoutCache = new WeakMap<
    Readonly<TSESTree.Program>,
    ProgramInsertionLayout
>();

const IMPORT_KEYWORD = "import" as const;
const FROM_KEYWORD = "from" as const;

type ParsedQuotedStringLiteral = Readonly<{
    endIndex: number;
    value: string;
}>;

const skipLeadingWhitespace = ({
    startIndex,
    text,
}: Readonly<{
    startIndex: number;
    text: string;
}>): number => {
    let index = startIndex;

    while (
        index < text.length &&
        isKnownWhitespaceCharacter(text[index] ?? "")
    ) {
        index += 1;
    }

    return index;
};

const parseQuotedStringLiteral = ({
    startIndex,
    text,
}: Readonly<{
    startIndex: number;
    text: string;
}>): null | ParsedQuotedStringLiteral => {
    const quoteCharacter = text.at(startIndex);
    if (quoteCharacter !== '"' && quoteCharacter !== "'") {
        return null;
    }

    for (let index = startIndex + 1; index < text.length; index += 1) {
        const currentCharacter = text[index];

        if (currentCharacter === "\\") {
            const escapedCharacter = text[index + 1];
            if (escapedCharacter === undefined) {
                return null;
            }

            index += 1;
            continue;
        }

        if (currentCharacter === quoteCharacter) {
            return {
                endIndex: index,
                value: text.slice(startIndex + 1, index),
            };
        }
    }

    return null;
};
const findLastFromKeywordOutsideStrings = (text: string): null | number => {
    let activeQuoteCharacter: null | string = null;
    let lastFromKeywordIndex: null | number = null;

    for (let index = 0; index < text.length; index += 1) {
        const currentCharacter = text[index];

        if (activeQuoteCharacter !== null) {
            if (currentCharacter === "\\") {
                index += 1;
                continue;
            }

            if (currentCharacter === activeQuoteCharacter) {
                activeQuoteCharacter = null;
            }

            continue;
        }

        if (currentCharacter === '"' || currentCharacter === "'") {
            activeQuoteCharacter = currentCharacter;
            continue;
        }

        if (!text.startsWith(FROM_KEYWORD, index)) {
            continue;
        }

        const previousCharacter = text[index - 1] ?? "";
        const nextCharacter = text[index + FROM_KEYWORD.length] ?? "";
        const hasWordBoundaryBefore =
            index === 0 || !isAsciiIdentifierPartCharacter(previousCharacter);
        const hasWordBoundaryAfter =
            index + FROM_KEYWORD.length >= text.length ||
            !isAsciiIdentifierPartCharacter(nextCharacter);

        if (hasWordBoundaryBefore && hasWordBoundaryAfter) {
            lastFromKeywordIndex = index;
        }
    }

    return lastFromKeywordIndex;
};

const isTrailingImportText = (text: string): boolean => {
    const trailingText = text.trim();

    return trailingText === "" || trailingText === ";";
};

/**
 * Extract the module specifier from an import declaration text snippet.
 */
const getModuleSpecifierFromImportDeclarationText = (
    importDeclarationText: string
): null | string => {
    const trimmedImportText = importDeclarationText.trim();
    if (!trimmedImportText.startsWith(IMPORT_KEYWORD)) {
        return null;
    }

    const importClauseStart = skipLeadingWhitespace({
        startIndex: IMPORT_KEYWORD.length,
        text: trimmedImportText,
    });

    const sideEffectImportModuleSpecifier = parseQuotedStringLiteral({
        startIndex: importClauseStart,
        text: trimmedImportText,
    });

    if (sideEffectImportModuleSpecifier !== null) {
        const trailingImportText = trimmedImportText.slice(
            sideEffectImportModuleSpecifier.endIndex + 1
        );

        return isTrailingImportText(trailingImportText)
            ? sideEffectImportModuleSpecifier.value
            : null;
    }

    const fromKeywordIndex =
        findLastFromKeywordOutsideStrings(trimmedImportText);
    if (fromKeywordIndex === null) {
        return null;
    }

    const moduleSpecifierStart = skipLeadingWhitespace({
        startIndex: fromKeywordIndex + FROM_KEYWORD.length,
        text: trimmedImportText,
    });
    const fromClauseModuleSpecifier = parseQuotedStringLiteral({
        startIndex: moduleSpecifierStart,
        text: trimmedImportText,
    });

    if (fromClauseModuleSpecifier === null) {
        return null;
    }

    const trailingImportText = trimmedImportText.slice(
        fromClauseModuleSpecifier.endIndex + 1
    );

    return isTrailingImportText(trailingImportText)
        ? fromClauseModuleSpecifier.value
        : null;
};

/**
 * Determine whether a module specifier is relative (`./` or `../`) or rooted.
 */
const isRelativeModuleSpecifier = (moduleSpecifier: string): boolean =>
    moduleSpecifier.startsWith(".") || moduleSpecifier.startsWith("/");

/**
 * Read a string-valued module specifier from an import declaration node.
 */
const getImportDeclarationModuleSpecifier = (
    importDeclaration: Readonly<TSESTree.ImportDeclaration>
): null | string => {
    const sourceValue = importDeclaration.source.value;

    return typeof sourceValue === "string" ? sourceValue : null;
};

/**
 * Check whether a Program statement is part of the directive prologue (for
 * example, `"use strict"`).
 */
const isDirectiveExpressionStatement = (
    statement: Readonly<TSESTree.ProgramStatement>
): statement is TSESTree.ExpressionStatement & { directive: string } =>
    statement.type === "ExpressionStatement" &&
    typeof statement.directive === "string";

/**
 * Read and validate a node range tuple.
 *
 * @param node - Node whose range should be extracted.
 *
 * @returns `[start, end]` tuple when available and valid; otherwise `null`.
 */
const getNodeRange = (
    node: Readonly<TSESTree.Node>
): null | readonly [number, number] => {
    const nodeRange = node.range;

    if (!Array.isArray(nodeRange)) {
        return null;
    }

    const [start, end] = nodeRange;

    if (!isInteger(start) || !isInteger(end)) {
        return null;
    }

    if (start < 0 || end < start) {
        return null;
    }

    return [start, end];
};

/**
 * Read the numeric start offset from an ESTree node range tuple.
 *
 * @param node - Node whose start offset should be extracted.
 *
 * @returns Numeric start offset when available; otherwise `null`.
 */
const getNodeRangeStart = (node: Readonly<TSESTree.Node>): null | number => {
    const nodeRange = getNodeRange(node);
    if (nodeRange === null) {
        return null;
    }

    return arrayAt(nodeRange, 0) ?? null;
};

/**
 * Read and validate the Program end offset from its range tuple.
 *
 * @param programNode - Program node whose range end should be read.
 *
 * @returns Valid end offset when available; otherwise `null`.
 */
const getProgramRangeEnd = (
    programNode: Readonly<TSESTree.Program>
): null | number => {
    const programRange = getNodeRange(programNode);

    return programRange?.[1] ?? null;
};

/**
 * Build and cache insertion-layout metadata for one Program.
 */
const getProgramInsertionLayout = (
    programNode: Readonly<TSESTree.Program>
): ProgramInsertionLayout => {
    const existingLayout = programInsertionLayoutCache.get(programNode);
    if (existingLayout) {
        return existingLayout;
    }

    const importDeclarations: TSESTree.ImportDeclaration[] = [];
    let firstRelativeImportDeclaration: null | Readonly<TSESTree.ImportDeclaration> =
        null;
    let lastNonRelativeImportDeclaration: null | Readonly<TSESTree.ImportDeclaration> =
        null;
    let lastDirectiveStatement: null | Readonly<TSESTree.ExpressionStatement> =
        null;
    let inDirectivePrologue = true;

    for (const statement of programNode.body) {
        if (inDirectivePrologue && isDirectiveExpressionStatement(statement)) {
            lastDirectiveStatement = statement;
        } else {
            inDirectivePrologue = false;
        }

        if (statement.type !== "ImportDeclaration") {
            continue;
        }

        importDeclarations.push(statement);

        const existingModuleSpecifier =
            getImportDeclarationModuleSpecifier(statement);

        if (
            typeof existingModuleSpecifier === "string" &&
            isRelativeModuleSpecifier(existingModuleSpecifier)
        ) {
            firstRelativeImportDeclaration ??= statement;

            continue;
        }

        lastNonRelativeImportDeclaration = statement;
    }

    const [firstStatement] = programNode.body;

    const layout: ProgramInsertionLayout = Object.freeze({
        firstRelativeImportDeclaration,
        firstStatementStart:
            firstStatement === undefined
                ? null
                : getNodeRangeStart(firstStatement),
        importDeclarations: Object.freeze(importDeclarations),
        lastDirectiveStatement,
        lastImportDeclaration: arrayAt(importDeclarations, -1) ?? null,
        lastNonRelativeImportDeclaration,
        programEnd: getProgramRangeEnd(programNode),
    });

    programInsertionLayoutCache.set(programNode, layout);

    return layout;
};

/**
 * Create a fixer that inserts an import declaration in a safe location: after
 * existing imports, after directive prologue, before first statement, or at
 * file end for empty programs.
 *
 * @param fixer - Rule fixer from ESLint.
 * @param referenceNode - Node used to discover the enclosing Program.
 * @param importDeclarationText - Full import declaration text to insert.
 *
 * @returns Rule fix when insertion is possible; otherwise `null`.
 */
export const createImportInsertionFix = ({
    fixer,
    importDeclarationText,
    referenceNode,
}: Readonly<{
    fixer: TSESLint.RuleFixer;
    importDeclarationText: string;
    referenceNode: Readonly<TSESTree.Node>;
}>): null | TSESLint.RuleFix => {
    if (isImportInsertionFixesDisabledForNode(referenceNode)) {
        return null;
    }

    const normalizedImportDeclarationText = importDeclarationText.trim();
    if (normalizedImportDeclarationText.length === 0) {
        return null;
    }

    const programNode = getProgramNode(referenceNode);
    if (!programNode) {
        return null;
    }

    const insertionLayout = getProgramInsertionLayout(programNode);

    if (insertionLayout.importDeclarations.length > 0) {
        const moduleSpecifier = getModuleSpecifierFromImportDeclarationText(
            normalizedImportDeclarationText
        );

        if (
            typeof moduleSpecifier === "string" &&
            !isRelativeModuleSpecifier(moduleSpecifier)
        ) {
            if (insertionLayout.lastNonRelativeImportDeclaration !== null) {
                return fixer.insertTextAfter(
                    insertionLayout.lastNonRelativeImportDeclaration,
                    `\n${normalizedImportDeclarationText}`
                );
            }

            if (insertionLayout.firstRelativeImportDeclaration !== null) {
                const firstRelativeImportStart = getNodeRangeStart(
                    insertionLayout.firstRelativeImportDeclaration
                );

                if (firstRelativeImportStart !== null) {
                    return fixer.insertTextBeforeRange(
                        [firstRelativeImportStart, firstRelativeImportStart],
                        `${normalizedImportDeclarationText}\n`
                    );
                }
            }
        }
    }

    if (insertionLayout.lastImportDeclaration !== null) {
        return fixer.insertTextAfter(
            insertionLayout.lastImportDeclaration,
            `\n${normalizedImportDeclarationText}`
        );
    }

    if (insertionLayout.lastDirectiveStatement !== null) {
        return fixer.insertTextAfter(
            insertionLayout.lastDirectiveStatement,
            `\n${normalizedImportDeclarationText}`
        );
    }

    if (insertionLayout.firstStatementStart !== null) {
        return fixer.insertTextBeforeRange(
            [
                insertionLayout.firstStatementStart,
                insertionLayout.firstStatementStart,
            ],
            `${normalizedImportDeclarationText}\n`
        );
    }

    if (insertionLayout.programEnd === null) {
        return null;
    }

    return fixer.insertTextBeforeRange(
        [insertionLayout.programEnd, insertionLayout.programEnd],
        `${insertionLayout.programEnd === 0 ? "" : "\n"}${normalizedImportDeclarationText}\n`
    );
};
