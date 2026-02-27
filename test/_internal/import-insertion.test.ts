import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { describe, expect, it, vi } from "vitest";

import { createImportInsertionFix } from "../../src/_internal/import-insertion";

const createProgram = (
    body: readonly Readonly<TSESTree.ProgramStatement>[]
): TSESTree.Program =>
    ({
        body,
        comments: [],
        range: [0, 100],
        sourceType: "module",
        tokens: [],
        type: "Program",
    }) as unknown as TSESTree.Program;

describe(createImportInsertionFix, () => {
    it("returns null for blank import text", () => {
        const program = createProgram([]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertAfter = vi.fn();
        const insertBeforeRange = vi.fn();

        const fixer = {
            insertTextAfter: insertAfter,
            insertTextBeforeRange: insertBeforeRange,
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: "   \n\t ",
            referenceNode,
        });

        expect(fix).toBeNull();
        expect(insertAfter).not.toHaveBeenCalled();
        expect(insertBeforeRange).not.toHaveBeenCalled();
    });

    it("trims import text before insertion", () => {
        const importDeclaration = {
            range: [0, 20],
            source: {
                value: "existing",
            },
            specifiers: [],
            type: "ImportDeclaration",
        } as unknown as TSESTree.ImportDeclaration;
        const program = createProgram([importDeclaration]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertAfterCalls: { target: unknown; text: string }[] = [];

        const fixer = {
            insertTextAfter: (target: unknown, text: string) => {
                insertAfterCalls.push({ target, text });

                return text;
            },
            insertTextBeforeRange: () => "",
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: '  import { arrayAt } from "ts-extras";  ',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertAfterCalls).toStrictEqual([
            {
                target: importDeclaration,
                text: '\nimport { arrayAt } from "ts-extras";',
            },
        ]);
    });

    it("does not treat non-directive string literals as directive prologue", () => {
        const nonDirectiveStringStatement = {
            expression: {
                type: "Literal",
                value: "just-a-string-expression",
            },
            range: [10, 40],
            type: "ExpressionStatement",
        } as unknown as TSESTree.ProgramStatement;
        const program = createProgram([nonDirectiveStringStatement]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertAfter = vi.fn();
        const insertBeforeRangeCalls: (readonly [
            readonly [number, number],
            string,
        ])[] = [];

        const fixer = {
            insertTextAfter: insertAfter,
            insertTextBeforeRange: (
                range: readonly [number, number],
                text: string
            ) => {
                insertBeforeRangeCalls.push([range, text]);

                return text;
            },
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertAfter).not.toHaveBeenCalled();
        expect(insertBeforeRangeCalls).toStrictEqual([
            [[10, 10], 'import { arrayAt } from "ts-extras";\n'],
        ]);
    });

    it("inserts after real directive prologue statements", () => {
        const directiveStatement = {
            directive: "use client",
            expression: {
                type: "Literal",
                value: "use client",
            },
            range: [0, 12],
            type: "ExpressionStatement",
        } as unknown as TSESTree.ProgramStatement;
        const firstStatement = {
            range: [20, 30],
            type: "ExpressionStatement",
        } as unknown as TSESTree.ProgramStatement;
        const program = createProgram([directiveStatement, firstStatement]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertAfterCalls: (readonly [unknown, string])[] = [];
        const insertBeforeRange = vi.fn();

        const fixer = {
            insertTextAfter: (target: unknown, text: string) => {
                insertAfterCalls.push([target, text]);

                return text;
            },
            insertTextBeforeRange: insertBeforeRange,
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertAfterCalls).toStrictEqual([
            [directiveStatement, '\nimport { arrayAt } from "ts-extras";'],
        ]);
        expect(insertBeforeRange).not.toHaveBeenCalled();
    });
});
