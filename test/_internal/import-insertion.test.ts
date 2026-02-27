import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { describe, expect, it, vi } from "vitest";

import { createImportInsertionFix } from "../../src/_internal/import-insertion";
import { registerProgramSettingsForContext } from "../../src/_internal/plugin-settings";

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

const createContext = ({
    program,
    settings,
}: Readonly<{
    program: TSESTree.Program;
    settings: unknown;
}>): TSESLint.RuleContext<string, UnknownArray> =>
    ({
        filename: "test-file.ts",
        id: "import-insertion-test-rule",
        languageOptions: {
            parser: {
                meta: {
                    name: "@typescript-eslint/parser",
                },
            },
        },
        options: [],
        report: () => undefined,
        settings,
        sourceCode: {
            ast: program,
        },
    }) as unknown as TSESLint.RuleContext<string, UnknownArray>;

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

    it("returns null when reference node is not attached to a Program", () => {
        const detachedReferenceNode = {
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: vi.fn(),
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode: detachedReferenceNode,
        });

        expect(fix).toBeNull();
    });

    it("returns null when import insertion fixes are disabled via settings", () => {
        const program = createProgram([]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        registerProgramSettingsForContext(
            createContext({
                program,
                settings: {
                    typefest: {
                        disableImportInsertionFixes: true,
                    },
                },
            })
        );

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: vi.fn(),
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeNull();
    });

    it("falls back to inserting at file end when first statement range is malformed", () => {
        const firstStatementWithoutRange = {
            type: "ExpressionStatement",
        } as unknown as TSESTree.ProgramStatement;
        const program = {
            ...createProgram([firstStatementWithoutRange]),
            range: [0, 90],
        } as TSESTree.Program;
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: (
                range: readonly [number, number],
                text: string
            ) => {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertBeforeRangeCalls).toStrictEqual([
            {
                range: [90, 90],
                text: '\nimport { arrayAt } from "ts-extras";\n',
            },
        ]);
    });

    it("inserts without a leading newline when inserting into an empty file", () => {
        const emptyProgramAtZero = {
            ...createProgram([]),
            range: [0, 0],
        } as TSESTree.Program;
        const referenceNode = {
            parent: emptyProgramAtZero,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: (
                range: readonly [number, number],
                text: string
            ) => {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertBeforeRangeCalls).toStrictEqual([
            {
                range: [0, 0],
                text: 'import { arrayAt } from "ts-extras";\n',
            },
        ]);
    });

    it("returns null when program range end cannot be derived", () => {
        const programWithInvalidRange = {
            ...createProgram([]),
            range: [0, -1],
        } as unknown as TSESTree.Program;
        const referenceNode = {
            parent: programWithInvalidRange,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: vi.fn(),
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeNull();
    });

    it("returns null when program range is not an array", () => {
        const programWithNonArrayRange = {
            ...createProgram([]),
            range: "invalid",
        } as unknown as TSESTree.Program;
        const referenceNode = {
            parent: programWithNonArrayRange,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: vi.fn(),
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeNull();
    });
});
