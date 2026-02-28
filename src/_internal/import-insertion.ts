/**
 * @packageDocumentation
 * Shared utilities for safely inserting import declarations in fixer output.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { getProgramNode } from "./ast-node.js";
import { isImportInsertionFixesDisabledForNode } from "./plugin-settings.js";

/**
 * Collects import declarations from a program body in source order.
 *
 * @param programNode - Program node to inspect.
 *
 * @returns Ordered import declaration list from the program body.
 */
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

/**
 * Check whether a Program statement is part of the directive prologue (`"use
 * strict"`, etc.).
 */
const isDirectiveExpressionStatement = (
    statement: Readonly<TSESTree.ProgramStatement>
): statement is TSESTree.ExpressionStatement & { directive: string } =>
    statement.type === "ExpressionStatement" &&
    typeof statement.directive === "string";

/**
 * Resolve the last directive statement in the file prologue.
 *
 * @param programNode - Program node to inspect.
 *
 * @returns Final directive statement before non-directive code; otherwise
 *   `null`.
 */
const getLastDirectivePrologueStatement = (
    programNode: Readonly<TSESTree.Program>
): null | Readonly<TSESTree.ExpressionStatement> => {
    let lastDirectiveStatement: null | Readonly<TSESTree.ExpressionStatement> =
        null;

    for (const statement of programNode.body) {
        if (!isDirectiveExpressionStatement(statement)) {
            break;
        }

        lastDirectiveStatement = statement;
    }

    return lastDirectiveStatement;
};

/**
 * Read the numeric start offset from an ESTree node range tuple.
 *
 * @param node - Node whose start offset should be extracted.
 *
 * @returns Numeric start offset when available; otherwise `null`.
 */
const getNodeRangeStart = (node: Readonly<TSESTree.Node>): null | number => {
    const nodeRange = (node as Readonly<TSESTree.Node> & { range?: unknown })
        .range;

    if (!Array.isArray(nodeRange) || typeof nodeRange[0] !== "number") {
        return null;
    }

    return nodeRange[0];
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
    const programRange = (
        programNode as Readonly<TSESTree.Program> & { range?: unknown }
    ).range;

    if (!Array.isArray(programRange) || typeof programRange[1] !== "number") {
        return null;
    }

    const programEnd = programRange[1];
    if (!Number.isInteger(programEnd) || programEnd < 0) {
        return null;
    }

    return programEnd;
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

    const importDeclarations = collectProgramImportDeclarations(programNode);
    const lastImportDeclaration = importDeclarations.at(-1);
    if (lastImportDeclaration) {
        return fixer.insertTextAfter(
            lastImportDeclaration,
            `\n${normalizedImportDeclarationText}`
        );
    }

    const lastDirectiveStatement =
        getLastDirectivePrologueStatement(programNode);
    if (lastDirectiveStatement) {
        return fixer.insertTextAfter(
            lastDirectiveStatement,
            `\n${normalizedImportDeclarationText}`
        );
    }

    const [firstStatement] = programNode.body;
    if (firstStatement) {
        const firstStatementStart = getNodeRangeStart(firstStatement);
        if (firstStatementStart !== null) {
            return fixer.insertTextBeforeRange(
                [firstStatementStart, firstStatementStart],
                `${normalizedImportDeclarationText}\n`
            );
        }
    }

    const programEnd = getProgramRangeEnd(programNode);
    if (programEnd === null) {
        return null;
    }

    return fixer.insertTextBeforeRange(
        [programEnd, programEnd],
        `${programEnd === 0 ? "" : "\n"}${normalizedImportDeclarationText}\n`
    );
};
