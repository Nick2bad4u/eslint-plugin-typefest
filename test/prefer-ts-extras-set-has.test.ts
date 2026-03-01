/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import ts from "typescript";
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

const ruleId = "prefer-ts-extras-set-has";
const docsDescription =
    "require ts-extras setHas over Set#has for stronger element narrowing.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-set-has";
const preferTsExtrasSetHasMessage =
    "Prefer `setHas` from `ts-extras` over `set.has(...)` for stronger element narrowing.";
const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-set-has.valid.ts";
const invalidFixtureName = "prefer-ts-extras-set-has.invalid.ts";
const computedAccessValidCode = [
    "const values = new Set([1, 2, 3]);",
    'const hasValue = values["has"](2);',
    "String(hasValue);",
].join("\n");
const nonSetReceiverValidCode = [
    "const helper = {",
    "    has(value: number): boolean {",
    "        return value === 1;",
    "    },",
    "};",
    "const hasValue = helper.has(1);",
    "String(hasValue);",
].join("\n");
const setDifferentMethodValidCode = [
    "const values = new Set([1, 2, 3]);",
    "values.clear();",
    "String(values.size);",
].join("\n");
const unionSetInvalidCode = [
    "const values: Set<number> | ReadonlySet<number> = new Set([1, 2]);",
    "const hasValue = values.has(2);",
    "String(hasValue);",
].join("\n");
const readonlySetInvalidCode = [
    "const values: ReadonlySet<number> = new Set([1, 2]);",
    "const hasValue = values.has(2);",
    "String(hasValue);",
].join("\n");
const readonlySetInvalidOutput = [
    'import { setHas } from "ts-extras";',
    "const values: ReadonlySet<number> = new Set([1, 2]);",
    "const hasValue = setHas(values, 2);",
    "String(hasValue);",
].join("\n");
const unionSetInvalidOutput = [
    'import { setHas } from "ts-extras";',
    "const values: Set<number> | ReadonlySet<number> = new Set([1, 2]);",
    "const hasValue = setHas(values, 2);",
    "String(hasValue);",
].join("\n");
const mixedUnionInvalidCode = [
    "declare const values: Set<number> | Map<number, number>;",
    "const hasValue = values.has(2);",
    "String(hasValue);",
].join("\n");
const mixedUnionInvalidOutput = [
    'import { setHas } from "ts-extras";',
    "declare const values: Set<number> | Map<number, number>;",
    "const hasValue = setHas(values, 2);",
    "String(hasValue);",
].join("\n");
const reversedMixedUnionInvalidCode = [
    "declare const values: Map<number, number> | Set<number>;",
    "const hasValue = values.has(2);",
    "String(hasValue);",
].join("\n");
const reversedMixedUnionInvalidOutput = [
    'import { setHas } from "ts-extras";',
    "declare const values: Map<number, number> | Set<number>;",
    "const hasValue = setHas(values, 2);",
    "String(hasValue);",
].join("\n");
const declaredUnionSetInvalidCode = [
    "declare const values: Set<number> | ReadonlySet<number>;",
    "const hasValue = values.has(2);",
    "String(hasValue);",
].join("\n");
const declaredUnionSetInvalidOutput = [
    'import { setHas } from "ts-extras";',
    "declare const values: Set<number> | ReadonlySet<number>;",
    "const hasValue = setHas(values, 2);",
    "String(hasValue);",
].join("\n");
const inlineFixableCode = [
    'import { setHas } from "ts-extras";',
    "",
    "const values = new Set([1, 2, 3]);",
    "const hasValue = values.has(2);",
].join("\n");
const inlineFixableOutput = [
    'import { setHas } from "ts-extras";',
    "",
    "const values = new Set([1, 2, 3]);",
    "const hasValue = setHas(values, 2);",
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type ArgumentTemplateId =
    | "empty"
    | "identifier"
    | "literal"
    | "multiple"
    | "spread";

type ReceiverTemplateId =
    | "callExpression"
    | "identifier"
    | "memberExpression"
    | "parenthesizedIdentifier";

const argumentTemplateIdArbitrary = fc.constantFrom(
    "empty",
    "identifier",
    "literal",
    "multiple",
    "spread"
);

const receiverTemplateIdArbitrary = fc.constantFrom(
    "identifier",
    "memberExpression",
    "callExpression",
    "parenthesizedIdentifier"
);

const buildArgumentTemplate = (
    templateId: ArgumentTemplateId
): Readonly<{
    argumentsText: string;
    declarations: readonly string[];
}> => {
    if (templateId === "identifier") {
        return {
            argumentsText: "candidate",
            declarations: ["declare const candidate: number;"],
        };
    }

    if (templateId === "literal") {
        return {
            argumentsText: "2",
            declarations: [],
        };
    }

    if (templateId === "multiple") {
        return {
            argumentsText: "candidate, 2",
            declarations: ["declare const candidate: number;"],
        };
    }

    if (templateId === "spread") {
        return {
            argumentsText: "...candidates",
            declarations: ["declare const candidates: number[];"],
        };
    }

    return {
        argumentsText: "",
        declarations: [],
    };
};

const buildReceiverTemplate = (
    templateId: ReceiverTemplateId
): Readonly<{
    declarations: readonly string[];
    receiverText: string;
}> => {
    if (templateId === "identifier") {
        return {
            declarations: ["declare const values: Set<number>;"],
            receiverText: "values",
        };
    }

    if (templateId === "memberExpression") {
        return {
            declarations: [
                "declare const registry: { readonly current: Set<number> };",
            ],
            receiverText: "registry.current",
        };
    }

    if (templateId === "callExpression") {
        return {
            declarations: ["declare function readSet(): Set<number>;"],
            receiverText: "readSet()",
        };
    }

    return {
        declarations: ["declare const values: Set<number>;"],
        receiverText: "(values)",
    };
};

const getHasValueCallExpressionFromDeclarator = (
    declaration: Readonly<TSESTree.VariableDeclarator>
): null | TSESTree.CallExpression => {
    if (
        declaration.id.type === AST_NODE_TYPES.Identifier &&
        declaration.id.name === "hasValue" &&
        declaration.init?.type === AST_NODE_TYPES.CallExpression
    ) {
        return declaration.init;
    }

    return null;
};

const getHasValueCallExpressionFromStatement = (
    statement: Readonly<TSESTree.ProgramStatement>
): null | TSESTree.CallExpression => {
    if (statement.type !== AST_NODE_TYPES.VariableDeclaration) {
        return null;
    }

    for (const declaration of statement.declarations) {
        const callExpression =
            getHasValueCallExpressionFromDeclarator(declaration);

        if (callExpression) {
            return callExpression;
        }
    }

    return null;
};

const parseCallExpressionFromCode = (
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
            getHasValueCallExpressionFromStatement(statement);

        if (callExpression) {
            if (
                callExpression.callee.type !== AST_NODE_TYPES.MemberExpression
            ) {
                throw new Error(
                    "Expected generated hasValue initializer to use a member-expression callee"
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

    throw new Error(
        "Expected generated code to include hasValue call expression"
    );
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

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasSetHas: preferTsExtrasSetHasMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-set-has metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-set-has internal listener guards", () => {
    it("ignores non-Identifier member property even when object type is Set-like", async () => {
        const reportCalls: { messageId?: string }[] = [];

        const fakeSetType = {
            isUnion: () => false,
        };

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Map([["setHas", new Set(["setHas"])]]),
                createMethodToFunctionCallFix,
            }));

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                getTypedRuleServices: () => ({
                    checker: {
                        getTypeAtLocation: () => fakeSetType,
                        typeToString: () => "Set<number>",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => ({ kind: "Identifier" }),
                        },
                    },
                }),
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createMethodToFunctionCallFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-set-has")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                },
            });

            const callExpressionListener = listeners.CallExpression;

            expect(callExpressionListener).toBeTypeOf("function");

            const privatePropertyHasCallNode = {
                callee: {
                    computed: false,
                    object: {
                        type: "Identifier",
                    },
                    property: {
                        name: "has",
                        type: "PrivateIdentifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            callExpressionListener?.(privatePropertyHasCallNode);

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("swallows parser-service failures without reporting", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                getTypedRuleServices: () => ({
                    checker: {
                        getTypeAtLocation: () => ({ isUnion: () => false }),
                        typeToString: () => "Set<number>",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => {
                                throw new Error("lookup failed");
                            },
                        },
                    },
                }),
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createMethodToFunctionCallFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-set-has")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                },
            });

            const callExpressionListener = listeners.CallExpression;

            expect(callExpressionListener).toBeTypeOf("function");

            const identifierHasCallNode = {
                callee: {
                    computed: false,
                    object: {
                        type: "Identifier",
                    },
                    property: {
                        name: "has",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            callExpressionListener?.(identifierHasCallNode);

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("handles recursive unions, intersections, apparent types, and non-member callees", async () => {
        const reportCalls: { messageId?: string }[] = [];

        const setLeafType = {
            getSymbol: () => ({
                getName: () => "Set",
            }),
            isIntersection: () => false,
            isUnion: () => false,
        };

        const recursiveUnionType: {
            getSymbol: () => undefined;
            isIntersection: () => false;
            isUnion: () => true;
            types: unknown[];
        } = {
            getSymbol: () => undefined,
            isIntersection: () => false,
            isUnion: () => true,
            types: [],
        };

        recursiveUnionType.types = [recursiveUnionType];

        const intersectionType = {
            getSymbol: () => undefined,
            isIntersection: () => true,
            isUnion: () => false,
            types: [setLeafType],
        };

        const apparentTypeSource = {
            getSymbol: () => undefined,
            isIntersection: () => false,
            isUnion: () => false,
        };

        const nonClassLikeType = {
            getSymbol: () => ({
                declarations: [{ kind: -1 }],
                getName: () => "CustomType",
            }),
            isIntersection: () => false,
            isUnion: () => false,
        };

        const noSymbolLeafType = {
            getSymbol: () => undefined,
            isIntersection: () => false,
            isUnion: () => false,
        };

        const classLikeWithoutBaseTypes = {
            getSymbol: () => ({
                declarations: [{ kind: ts.SyntaxKind.InterfaceDeclaration }],
                getName: () => "CustomInterface",
            }),
            isIntersection: () => false,
            isUnion: () => false,
        };

        const classLikeSetBaseType = {
            getSymbol: () => ({
                declarations: [{ kind: ts.SyntaxKind.ClassDeclaration }],
                getName: () => "CustomClass",
            }),
            isIntersection: () => false,
            isUnion: () => false,
        };

        let currentObjectType: unknown = recursiveUnionType;

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                getTypedRuleServices: () => ({
                    checker: {
                        getApparentType: (type: unknown) =>
                            type === apparentTypeSource ? setLeafType : type,
                        getBaseTypes: (type: unknown) => {
                            if (type === classLikeSetBaseType) {
                                return [setLeafType];
                            }

                            if (type === classLikeWithoutBaseTypes) {
                                return undefined;
                            }

                            return [];
                        },
                        getTypeAtLocation: () => currentObjectType,
                        typeToString: () => "Set<number>",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => ({ kind: "Identifier" }),
                        },
                    },
                }),
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createMethodToFunctionCallFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-set-has")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                },
            });

            const callExpressionListener = listeners.CallExpression;

            expect(callExpressionListener).toBeTypeOf("function");

            const identifierHasCallNode = {
                callee: {
                    computed: false,
                    object: {
                        type: "Identifier",
                    },
                    property: {
                        name: "has",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            currentObjectType = recursiveUnionType;
            callExpressionListener?.(identifierHasCallNode);

            currentObjectType = intersectionType;
            callExpressionListener?.(identifierHasCallNode);

            currentObjectType = apparentTypeSource;
            callExpressionListener?.(identifierHasCallNode);

            currentObjectType = nonClassLikeType;
            callExpressionListener?.(identifierHasCallNode);

            currentObjectType = noSymbolLeafType;
            callExpressionListener?.(identifierHasCallNode);

            currentObjectType = classLikeWithoutBaseTypes;
            callExpressionListener?.(identifierHasCallNode);

            currentObjectType = classLikeSetBaseType;
            callExpressionListener?.(identifierHasCallNode);

            callExpressionListener?.({
                callee: {
                    name: "has",
                    type: "Identifier",
                },
                type: "CallExpression",
            });

            expect(reportCalls).toHaveLength(3);
            expect(
                reportCalls.map((descriptor) => descriptor.messageId)
            ).toStrictEqual([
                "preferTsExtrasSetHas",
                "preferTsExtrasSetHas",
                "preferTsExtrasSetHas",
            ]);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-set-has fast-check fix safety", () => {
    it("fast-check: set.has calls report and produce parseable setHas replacements", async () => {
        expect.hasAssertions();

        const setLikeType = {
            getSymbol: () => ({
                getName: () => "Set",
            }),
            isIntersection: () => false,
            isUnion: () => false,
        };

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                getTypedRuleServices: () => ({
                    checker: {
                        getApparentType: (type: unknown) => type,
                        getBaseTypes: () => [],
                        getTypeAtLocation: () => setLikeType,
                        typeToString: () => "Set<number>",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: () => ({ kind: "Identifier" }),
                        },
                    },
                }),
                isTestFilePath: () => false,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-set-has")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    receiverTemplateIdArbitrary,
                    argumentTemplateIdArbitrary,
                    (receiverTemplateId, argumentTemplateId) => {
                        const receiverTemplate =
                            buildReceiverTemplate(receiverTemplateId);
                        const argumentTemplate =
                            buildArgumentTemplate(argumentTemplateId);
                        const callArguments = argumentTemplate.argumentsText;
                        const code = [
                            'import { setHas } from "ts-extras";',
                            ...receiverTemplate.declarations,
                            ...argumentTemplate.declarations,
                            "",
                            `const hasValue = ${receiverTemplate.receiverText}.has(${callArguments});`,
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const {
                            ast,
                            callExpression,
                            callExpressionRange,
                            receiverText,
                        } = parseCallExpressionFromCode(code);
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
                                            "setHas",
                                            {
                                                defs: [
                                                    {
                                                        node: {
                                                            importKind: "value",
                                                            local: {
                                                                name: "setHas",
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
                            messageId: "preferTsExtrasSetHas",
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
                            callArguments.length > 0
                                ? `setHas(${receiverText}, ${callArguments})`
                                : `setHas(${receiverText})`;

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

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasSetHas",
                },
                {
                    messageId: "preferTsExtrasSetHas",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture set.has usage",
        },
        {
            code: unionSetInvalidCode,
            errors: [{ messageId: "preferTsExtrasSetHas" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports union of set and readonly set",
            output: unionSetInvalidOutput,
        },
        {
            code: readonlySetInvalidCode,
            errors: [{ messageId: "preferTsExtrasSetHas" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly set has call",
            output: readonlySetInvalidOutput,
        },
        {
            code: mixedUnionInvalidCode,
            errors: [{ messageId: "preferTsExtrasSetHas" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports union of set and map when calling has",
            output: mixedUnionInvalidOutput,
        },
        {
            code: reversedMixedUnionInvalidCode,
            errors: [{ messageId: "preferTsExtrasSetHas" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports union of map and set when calling has",
            output: reversedMixedUnionInvalidOutput,
        },
        {
            code: declaredUnionSetInvalidCode,
            errors: [{ messageId: "preferTsExtrasSetHas" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports declared set-like union has call",
            output: declaredUnionSetInvalidOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasSetHas" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes set.has() when setHas import is in scope",
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
            name: "ignores computed has member access",
        },
        {
            code: nonSetReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom object has method",
        },
        {
            code: setDifferentMethodValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-has set method invocation",
        },
    ],
});
