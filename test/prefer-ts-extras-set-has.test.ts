import { describe, expect, it, vi } from "vitest";
import ts from "typescript";

/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
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
