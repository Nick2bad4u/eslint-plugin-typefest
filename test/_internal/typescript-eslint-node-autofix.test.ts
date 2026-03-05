/**
 * @packageDocumentation
 * Unit tests for `@typescript-eslint` node-expression skip-checker fallbacks.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { describe, expect, it } from "vitest";

import { createTypeScriptEslintNodeExpressionSkipChecker } from "../../src/_internal/typescript-eslint-node-autofix";

type RuleContext = TSESLint.RuleContext<string, UnknownArray>;

const createImportDeclarationFromTypeScriptEslintUtils = (
    specifiers: readonly unknown[]
): TSESTree.ImportDeclaration =>
    ({
        attributes: [],
        importKind: "value",
        source: {
            raw: '"@typescript-eslint/utils"',
            type: "Literal",
            value: "@typescript-eslint/utils",
        },
        specifiers,
        type: "ImportDeclaration",
    }) as unknown as TSESTree.ImportDeclaration;

const createTSESTreeImportSpecifier = (
    localName: string
): TSESTree.ImportSpecifier =>
    ({
        imported: {
            name: "TSESTree",
            type: "Identifier",
        },
        importKind: "value",
        local: {
            name: localName,
            type: "Identifier",
        },
        type: "ImportSpecifier",
    }) as unknown as TSESTree.ImportSpecifier;

const createScopeWithVariable = (
    variableName: string,
    definitionNode: Readonly<TSESTree.Node>
): Readonly<TSESLint.Scope.Scope> =>
    ({
        set: new Map([
            [
                variableName,
                {
                    defs: [
                        {
                            node: definitionNode,
                        },
                    ],
                },
            ],
        ]),
        upper: null,
    }) as unknown as Readonly<TSESLint.Scope.Scope>;

const createRuleContext = ({
    definitionNode,
    definitionText,
    importStatements,
    variableName,
}: Readonly<{
    definitionNode: Readonly<TSESTree.Node>;
    definitionText: string;
    importStatements: readonly TSESTree.ProgramStatement[];
    variableName: string;
}>): Readonly<RuleContext> => {
    const textByNode = new Map<Readonly<TSESTree.Node>, string>([
        [definitionNode, definitionText],
    ]);

    return {
        sourceCode: {
            ast: {
                body: importStatements,
            },
            getScope: () =>
                createScopeWithVariable(variableName, definitionNode),
            getText: (node: Readonly<TSESTree.Node>) =>
                textByNode.get(node) ?? "",
        },
    } as unknown as Readonly<RuleContext>;
};

describe(createTypeScriptEslintNodeExpressionSkipChecker, () => {
    it("returns true for definition nodes containing qualified TSESTree type references", () => {
        const definitionNode = {
            id: {
                name: "nodeLike",
                type: "Identifier",
                typeAnnotation: {
                    type: "TSTypeAnnotation",
                    typeAnnotation: {
                        type: "TSTypeReference",
                        typeName: {
                            left: {
                                name: "TSESTree",
                                type: "Identifier",
                            },
                            right: {
                                name: "Node",
                                type: "Identifier",
                            },
                            type: "TSQualifiedName",
                        },
                    },
                },
            },
            init: null,
            type: "VariableDeclarator",
        } as unknown as TSESTree.VariableDeclarator;

        const context = createRuleContext({
            definitionNode,
            definitionText: "",
            importStatements: [
                createImportDeclarationFromTypeScriptEslintUtils([
                    createTSESTreeImportSpecifier("TSESTree"),
                ]),
            ],
            variableName: "nodeLike",
        });

        const shouldSkipExpression =
            createTypeScriptEslintNodeExpressionSkipChecker(context);

        expect(
            shouldSkipExpression({
                name: "nodeLike",
                type: "Identifier",
            } as TSESTree.Identifier)
        ).toBeTruthy();
    });

    it("returns false when no @typescript-eslint namespace import exists even if text contains TSESTree.", () => {
        const definitionNode = {
            type: "VariableDeclarator",
        } as unknown as TSESTree.VariableDeclarator;

        const context = createRuleContext({
            definitionNode,
            definitionText: "const nodeLike: TSESTree.Node = value;",
            importStatements: [],
            variableName: "nodeLike",
        });

        const shouldSkipExpression =
            createTypeScriptEslintNodeExpressionSkipChecker(context);

        expect(
            shouldSkipExpression({
                name: "nodeLike",
                type: "Identifier",
            } as TSESTree.Identifier)
        ).toBeFalsy();
    });

    it("returns true for imported aliases referenced in definition text fallback", () => {
        const definitionNode = {
            type: "VariableDeclarator",
        } as unknown as TSESTree.VariableDeclarator;

        const context = createRuleContext({
            definitionNode,
            definitionText: "const nodeLike: EST.Node = value;",
            importStatements: [
                createImportDeclarationFromTypeScriptEslintUtils([
                    createTSESTreeImportSpecifier("EST"),
                ]),
            ],
            variableName: "nodeLike",
        });

        const shouldSkipExpression =
            createTypeScriptEslintNodeExpressionSkipChecker(context);

        expect(
            shouldSkipExpression({
                name: "nodeLike",
                type: "Identifier",
            } as TSESTree.Identifier)
        ).toBeTruthy();
    });

    it("uses namespace-boundary matching for text fallback", () => {
        const definitionNode = {
            type: "VariableDeclarator",
        } as unknown as TSESTree.VariableDeclarator;

        const context = createRuleContext({
            definitionNode,
            definitionText: "const nodeLike: BEST.Node = value;",
            importStatements: [
                createImportDeclarationFromTypeScriptEslintUtils([
                    createTSESTreeImportSpecifier("EST"),
                ]),
            ],
            variableName: "nodeLike",
        });

        const shouldSkipExpression =
            createTypeScriptEslintNodeExpressionSkipChecker(context);

        expect(
            shouldSkipExpression({
                name: "nodeLike",
                type: "Identifier",
            } as TSESTree.Identifier)
        ).toBeFalsy();
    });
});
