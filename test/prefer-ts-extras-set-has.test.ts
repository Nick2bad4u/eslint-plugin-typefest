/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */

import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

import { createMethodToFunctionCallFix } from "../src/_internal/imported-value-symbols.js";
import { fastCheckRunConfig } from "./_internal/fast-check";
import {
    computedAccessValidCode,
    declaredUnionSetInvalidCode,
    declaredUnionSetInvalidOutput,
    inlineFixableCode,
    inlineFixableOutput,
    invalidFixtureName,
    mixedUnionInvalidCode,
    mixedUnionInvalidOutput,
    nonSetReceiverValidCode,
    readonlySetInvalidCode,
    readonlySetInvalidOutput,
    reversedMixedUnionInvalidCode,
    reversedMixedUnionInvalidOutput,
    setDifferentMethodValidCode,
    unionSetInvalidCode,
    unionSetInvalidOutput,
    validFixtureName,
} from "./_internal/prefer-ts-extras-set-has-cases";
import {
    argumentTemplateIdArbitrary,
    assertIsReplaceFixFunction,
    buildArgumentTemplate,
    buildReceiverTemplate,
    getSourceTextForNode,
    parseCallExpressionFromCode,
    parserOptions,
    receiverTemplateIdArbitrary,
} from "./_internal/prefer-ts-extras-set-has-runtime-harness";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
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

addTypeFestRuleMetadataSmokeTests(ruleId, {
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
                fastCheckRunConfig.default
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
