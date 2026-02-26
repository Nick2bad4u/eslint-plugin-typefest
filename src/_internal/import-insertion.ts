/**
 * @packageDocumentation
 * Shared utilities for safely inserting import declarations in fixer output.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { getProgramNode } from "./ast-node.js";
import { isImportInsertionFixesDisabledForNode } from "./plugin-settings.js";

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

const isDirectiveExpressionStatement = (
    statement: Readonly<TSESTree.ProgramStatement>
): statement is TSESTree.ExpressionStatement =>
    statement.type === "ExpressionStatement" &&
    statement.expression.type === "Literal" &&
    typeof statement.expression.value === "string";

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
        const [firstStatementStart] = firstStatement.range;

        return fixer.insertTextBeforeRange(
            [firstStatementStart, firstStatementStart],
            `${normalizedImportDeclarationText}\n`
        );
    }

    const [, programEnd] = programNode.range;
    return fixer.insertTextBeforeRange(
        [programEnd, programEnd],
        `${programEnd === 0 ? "" : "\n"}${normalizedImportDeclarationText}\n`
    );
};
