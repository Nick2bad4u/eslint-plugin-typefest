/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { createMethodToFunctionCallFix } from "../src/_internal/imported-value-symbols.js";
import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-string-split.valid.ts";
const invalidFixtureName = "prefer-ts-extras-string-split.invalid.ts";

const inlineInvalidCode = [
    "const value = 'a,b';",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");
const inlineInvalidOutput = [
    'import { stringSplit } from "ts-extras";',
    "const value = 'a,b';",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");

const computedAccessValidCode = [
    "const value = 'a,b';",
    'const parts = value["split"](",");',
    "String(parts);",
].join("\n");

const nonStringReceiverValidCode = [
    "const helper = {",
    "    split(separator: string): readonly string[] {",
    "        return [separator];",
    "    },",
    "};",
    "const parts = helper.split(',');",
    "String(parts);",
].join("\n");
const differentStringMethodValidCode = [
    "const value = 'a,b';",
    "const normalized = value.toUpperCase();",
    "String(normalized);",
].join("\n");
const unionStringInvalidCode = [
    "const value: 'a,b' | 'c,d' = 'a,b';",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");
const unionStringInvalidOutput = [
    'import { stringSplit } from "ts-extras";',
    "const value: 'a,b' | 'c,d' = 'a,b';",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");
const mixedUnionInvalidCode = [
    "declare const value: string | { split(separator: string): readonly string[] };",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");
const mixedUnionInvalidOutput = [
    'import { stringSplit } from "ts-extras";',
    "declare const value: string | { split(separator: string): readonly string[] };",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");
const declaredStringUnionInvalidCode = [
    "declare const value: string | String;",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");
const declaredStringUnionInvalidOutput = [
    'import { stringSplit } from "ts-extras";',
    "declare const value: string | String;",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");
const declaredStringObjectInvalidCode = [
    "declare const value: String;",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");
const declaredStringObjectInvalidOutput = [
    'import { stringSplit } from "ts-extras";',
    "declare const value: String;",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");
const intersectionStringInvalidCode = [
    "type BrandedString = string & { readonly __brand: 'BrandedString' };",
    "declare const value: BrandedString;",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");
const intersectionStringInvalidOutput = [
    'import { stringSplit } from "ts-extras";',
    "type BrandedString = string & { readonly __brand: 'BrandedString' };",
    "declare const value: BrandedString;",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");

const inlineFixableCode = [
    'import { stringSplit } from "ts-extras";',
    "",
    "const value = 'a,b';",
    "const parts = value.split(',');",
].join("\n");
const inlineFixableOutput = [
    'import { stringSplit } from "ts-extras";',
    "",
    "const value = 'a,b';",
    "const parts = stringSplit(value, ',');",
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type SplitArgumentTemplateId =
    | "empty"
    | "identifier"
    | "literal"
    | "multiple"
    | "spread";

type SplitReceiverTemplateId =
    | "callExpression"
    | "identifier"
    | "memberExpression"
    | "parenthesizedIdentifier";

const splitArgumentTemplateIdArbitrary = fc.constantFrom(
    "empty",
    "identifier",
    "literal",
    "multiple",
    "spread"
);

const splitReceiverTemplateIdArbitrary = fc.constantFrom(
    "identifier",
    "memberExpression",
    "callExpression",
    "parenthesizedIdentifier"
);

const buildSplitArgumentTemplate = (
    templateId: SplitArgumentTemplateId
): Readonly<{
    argumentsText: string;
    declarations: readonly string[];
}> => {
    if (templateId === "identifier") {
        return {
            argumentsText: "separator",
            declarations: ["declare const separator: string;"],
        };
    }

    if (templateId === "literal") {
        return {
            argumentsText: "','",
            declarations: [],
        };
    }

    if (templateId === "multiple") {
        return {
            argumentsText: "separator, 1",
            declarations: ["declare const separator: string;"],
        };
    }

    if (templateId === "spread") {
        return {
            argumentsText: "...separators",
            declarations: ["declare const separators: string[];"],
        };
    }

    return {
        argumentsText: "",
        declarations: [],
    };
};

const buildSplitReceiverTemplate = (
    templateId: SplitReceiverTemplateId
): Readonly<{
    declarations: readonly string[];
    receiverText: string;
}> => {
    if (templateId === "identifier") {
        return {
            declarations: ["declare const value: string;"],
            receiverText: "value",
        };
    }

    if (templateId === "memberExpression") {
        return {
            declarations: [
                "declare const holder: { readonly current: string };",
            ],
            receiverText: "holder.current",
        };
    }

    if (templateId === "callExpression") {
        return {
            declarations: ["declare function readValue(): string;"],
            receiverText: "readValue()",
        };
    }

    return {
        declarations: ["declare const value: string;"],
        receiverText: "(value)",
    };
};

const getPartsSplitCallExpressionFromDeclarator = (
    declaration: Readonly<TSESTree.VariableDeclarator>
): null | TSESTree.CallExpression => {
    if (
        declaration.id.type === AST_NODE_TYPES.Identifier &&
        declaration.id.name === "parts" &&
        declaration.init?.type === AST_NODE_TYPES.CallExpression
    ) {
        return declaration.init;
    }

    return null;
};

const getPartsSplitCallExpressionFromStatement = (
    statement: Readonly<TSESTree.ProgramStatement>
): null | TSESTree.CallExpression => {
    if (statement.type !== AST_NODE_TYPES.VariableDeclaration) {
        return null;
    }

    for (const declaration of statement.declarations) {
        const callExpression =
            getPartsSplitCallExpressionFromDeclarator(declaration);

        if (callExpression) {
            return callExpression;
        }
    }

    return null;
};

const parseSplitCallExpressionFromCode = (
    code: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    callExpression: TSESTree.CallExpression;
    callExpressionRange: readonly [number, number];
    receiverText: string;
}> => {
    const parsedResult = parser.parseForESLint(code, parserOptions);

    for (const statement of parsedResult.ast.body) {
        const callExpression =
            getPartsSplitCallExpressionFromStatement(statement);

        if (callExpression) {
            if (
                callExpression.callee.type !== AST_NODE_TYPES.MemberExpression
            ) {
                throw new Error(
                    "Expected generated parts initializer to use a member-expression callee"
                );
            }

            return {
                ast: parsedResult.ast,
                callExpression,
                callExpressionRange: callExpression.range,
                receiverText: code.slice(
                    callExpression.callee.object.range[0],
                    callExpression.callee.object.range[1]
                ),
            };
        }
    }

    throw new Error("Expected generated code to include parts call expression");
};

const getSourceTextForNode = ({
    code,
    node,
}: Readonly<{
    code: string;
    node: unknown;
}>): string => {
    if (typeof node !== "object" || node === null || !("range" in node)) {
        return "";
    }

    const nodeRange = (node as Readonly<{ range?: readonly [number, number] }>)
        .range;

    if (!nodeRange) {
        return "";
    }

    return code.slice(nodeRange[0], nodeRange[1]);
};

type ReplaceTextOnlyFixer = Readonly<{
    replaceText: (node: unknown, text: string) => unknown;
}>;

const assertIsReplaceFixFunction: (
    value: unknown
) => asserts value is (fixer: ReplaceTextOnlyFixer) => unknown = (value) => {
    if (typeof value !== "function") {
        throw new TypeError("Expected report descriptor fix to be a function");
    }
};

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-ts-extras-string-split",
    {
        defaultOptions: [],
        docsDescription:
            "require ts-extras stringSplit over String#split for stronger tuple inference.",
        enforceRuleShape: true,
        messages: {
            preferTsExtrasStringSplit:
                "Prefer `stringSplit` from `ts-extras` over `string.split(...)` for stronger tuple inference.",
        },
        name: "prefer-ts-extras-string-split",
    }
);

describe("prefer-ts-extras-string-split source assertions", () => {
    it("keeps string-split string-like and member guards in source", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-ts-extras-string-split.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain("isTypeAssignableTo(");
        expect(ruleSource).toContain("getStringType?.()");
        expect(ruleSource).toContain(
            'candidateType.getSymbol()?.getName() === "String"'
        );
        expect(ruleSource).toContain(
            'node.callee.property.type !== "Identifier" ||'
        );
        expect(ruleSource).toContain("} catch {");
        expect(ruleSource).toContain("return;");
    });

    it("handles parser-service lookup failures without reporting", async () => {
        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                getTypedRuleServices: () => ({
                    checker: {
                        getTypeAtLocation: () => ({
                            isUnion: () => false,
                        }),
                        typeToString: () => "string",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: (): never => {
                                throw new Error("lookup failed");
                            },
                        },
                    },
                }),
                isTestFilePath: (): boolean => false,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-ts-extras-string-split")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            const parsedResult = parser.parseForESLint(
                [
                    "const value = 'a,b';",
                    "const parts = value.split(',');",
                ].join("\n"),
                {
                    ecmaVersion: "latest",
                    loc: true,
                    range: true,
                    sourceType: "module",
                }
            );

            const secondStatement = parsedResult.ast.body[1];

            expect(secondStatement?.type).toBe("VariableDeclaration");

            if (secondStatement?.type !== AST_NODE_TYPES.VariableDeclaration) {
                throw new Error("Expected variable declaration for split call");
            }

            const firstDeclarator = secondStatement.declarations[0];
            if (firstDeclarator?.init?.type !== AST_NODE_TYPES.CallExpression) {
                throw new Error(
                    "Expected call expression initializer for split call"
                );
            }

            const splitCallExpression = firstDeclarator.init;
            const report = vi.fn();

            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-ts-extras-string-split.invalid.ts",
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                },
            });

            expect(() => {
                listenerMap.CallExpression?.(splitCallExpression);
            }).not.toThrowError();

            expect(report).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("guards apparent-type recursion cycles without reporting", async () => {
        try {
            vi.resetModules();

            const apparentA = {
                getSymbol: (): undefined => undefined,
                isIntersection: (): boolean => false,
                isUnion: (): boolean => false,
            };
            const apparentB = {
                getSymbol: (): undefined => undefined,
                isIntersection: (): boolean => false,
                isUnion: (): boolean => false,
            };

            const getApparentType = vi.fn((candidate: unknown): unknown => {
                if (candidate === apparentA) {
                    return apparentB;
                }

                if (candidate === apparentB) {
                    return apparentA;
                }

                return candidate;
            });

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                getTypedRuleServices: () => ({
                    checker: {
                        getApparentType,
                        getStringType: () => ({
                            isIntersection: (): boolean => false,
                            isUnion: (): boolean => false,
                        }),
                        getTypeAtLocation: () => apparentA,
                        typeToString: () => "NonStringLike",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: (): object => ({
                                kind: "MockTypeNode",
                            }),
                        },
                    },
                }),
                isTestFilePath: (): boolean => false,
                isTypeAssignableTo: (): boolean => false,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-ts-extras-string-split")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            const parsedResult = parser.parseForESLint(
                [
                    "const value = { split(separator: string) { return [separator]; } };",
                    "const parts = value.split(',');",
                ].join("\n"),
                {
                    ecmaVersion: "latest",
                    loc: true,
                    range: true,
                    sourceType: "module",
                }
            );

            const secondStatement = parsedResult.ast.body[1];
            if (secondStatement?.type !== AST_NODE_TYPES.VariableDeclaration) {
                throw new Error("Expected variable declaration for split call");
            }

            const firstDeclarator = secondStatement.declarations[0];
            if (firstDeclarator?.init?.type !== AST_NODE_TYPES.CallExpression) {
                throw new Error(
                    "Expected call expression initializer for split call"
                );
            }

            const splitCallExpression = firstDeclarator.init;
            const report = vi.fn();

            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-ts-extras-string-split.invalid.ts",
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                },
            });

            listenerMap.CallExpression?.(splitCallExpression);

            expect(getApparentType).toHaveBeenCalled();
            expect(report).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: split() calls report and produce parseable stringSplit replacements", async () => {
        expect.hasAssertions();

        const stringLikeType = {
            getSymbol: () => ({
                getName: () => "String",
            }),
            isIntersection: () => false,
            isUnion: () => false,
        };

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Map([["stringSplit", new Set(["stringSplit"])]]),
                createMethodToFunctionCallFix,
            }));

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                getTypedRuleServices: () => ({
                    checker: {
                        getApparentType: (type: unknown) => type,
                        getStringType: () => stringLikeType,
                        getTypeAtLocation: () => stringLikeType,
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => ({ kind: "Identifier" }),
                        },
                    },
                }),
                isTestFilePath: (): boolean => false,
                isTypeAssignableTo: (): boolean => true,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-string-split")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    splitReceiverTemplateIdArbitrary,
                    splitArgumentTemplateIdArbitrary,
                    (receiverTemplateId, argumentTemplateId) => {
                        const receiverTemplate =
                            buildSplitReceiverTemplate(receiverTemplateId);
                        const argumentTemplate =
                            buildSplitArgumentTemplate(argumentTemplateId);
                        const splitArguments = argumentTemplate.argumentsText;
                        const code = [
                            'import { stringSplit } from "ts-extras";',
                            ...receiverTemplate.declarations,
                            ...argumentTemplate.declarations,
                            "",
                            `const parts = ${receiverTemplate.receiverText}.split(${splitArguments});`,
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const {
                            ast,
                            callExpression,
                            callExpressionRange,
                            receiverText,
                        } = parseSplitCallExpressionFromCode(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                        }>[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: Readonly<{
                                    fix?: unknown;
                                    messageId?: string;
                                }>
                            ) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getScope: () => ({
                                    set: new Map([
                                        [
                                            "stringSplit",
                                            {
                                                defs: [
                                                    {
                                                        node: {
                                                            importKind: "value",
                                                            local: {
                                                                name: "stringSplit",
                                                            },
                                                            parent: {
                                                                importKind:
                                                                    "value",
                                                                source: {
                                                                    type: "Literal",
                                                                    value: "ts-extras",
                                                                },
                                                                type: "ImportDeclaration",
                                                            },
                                                            type: "ImportSpecifier",
                                                        },
                                                        type: "ImportBinding",
                                                    },
                                                ],
                                            },
                                        ],
                                    ]),
                                    upper: null,
                                }),
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.CallExpression?.(callExpression);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferTsExtrasStringSplit",
                        });
                        expect(reportCalls[0]?.fix).toBeDefined();

                        const fixFunction: unknown = reportCalls[0]?.fix;
                        assertIsReplaceFixFunction(fixFunction);

                        let replacementText = "";

                        fixFunction({
                            replaceText(node, text): unknown {
                                expect(node).toBe(callExpression);

                                replacementText = text;

                                return text;
                            },
                        });

                        const expectedReplacementText =
                            splitArguments.length > 0
                                ? `stringSplit(${receiverText}, ${splitArguments})`
                                : `stringSplit(${receiverText})`;

                        expect(replacementText).toBe(expectedReplacementText);

                        const fixedCode =
                            code.slice(0, callExpressionRange[0]) +
                            replacementText +
                            code.slice(callExpressionRange[1]);

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrowError();
                    }
                ),
                fastCheckRunConfig.runs70
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(
    "prefer-ts-extras-string-split",
    getPluginRule("prefer-ts-extras-string-split"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasStringSplit",
                    },
                    {
                        messageId: "preferTsExtrasStringSplit",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture string.split usage",
            },
            {
                code: inlineInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports direct string.split call",
                output: inlineInvalidOutput,
            },
            {
                code: unionStringInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports literal string union split call",
                output: unionStringInvalidOutput,
            },
            {
                code: mixedUnionInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports mixed union split call",
                output: mixedUnionInvalidOutput,
            },
            {
                code: declaredStringUnionInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports declared string object union split call",
                output: declaredStringUnionInvalidOutput,
            },
            {
                code: declaredStringObjectInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports declared String object split call",
                output: declaredStringObjectInvalidOutput,
            },
            {
                code: intersectionStringInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports string intersections that preserve string split semantics",
                output: intersectionStringInvalidOutput,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes string.split() when stringSplit import is in scope",
                output: inlineFixableOutput,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: computedAccessValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores computed split member access",
            },
            {
                code: nonStringReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom non-string split method",
            },
            {
                code: differentStringMethodValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-split string method call",
            },
        ],
    }
);
