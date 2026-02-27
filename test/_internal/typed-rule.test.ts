import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";
/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import type ts from "typescript";

import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import {
    createTypedRule,
    getSignatureParameterTypeAt,
    getTypedRuleServices,
    isGlobalIdentifierNamed,
    isGlobalUndefinedIdentifier,
    isTestFilePath,
    isTypeAssignableTo,
} from "../../src/_internal/typed-rule";

const knownTestSuffixes = [
    ".spec.cts",
    ".spec.js",
    ".spec.jsx",
    ".spec.mts",
    ".spec.ts",
    ".spec.tsx",
    ".test.cts",
    ".test.js",
    ".test.jsx",
    ".test.mts",
    ".test.ts",
    ".test.tsx",
] as const;

/**
 * Helper utility for assert known suffixes property.
 *
 * @returns AssertKnownSuffixesProperty helper result.
 */

const assertKnownSuffixesProperty = (): void => {
    fc.assert(
        fc.property(
            fc.string({ maxLength: 32 }),
            fc.constantFrom(...knownTestSuffixes),
            (rawPrefix, suffix) => {
                const safePrefix = rawPrefix
                    .replaceAll("/", "_")
                    .replaceAll("\\", "_");
                const candidatePath = `${safePrefix.toUpperCase()}${suffix.toUpperCase()}`;

                expect(isTestFilePath(candidatePath)).toBeTruthy();
            }
        )
    );
};

/**
 * Helper utility for assert tests directory property.
 *
 * @returns AssertTestsDirectoryProperty helper result.
 */

const assertTestsDirectoryProperty = (): void => {
    fc.assert(
        fc.property(
            fc.array(fc.string({ maxLength: 12 }), {
                maxLength: 3,
                minLength: 1,
            }),
            (rawSegments) => {
                const sanitizedSegments = rawSegments.map((segment) =>
                    segment
                        .replaceAll("/", "_")
                        .replaceAll("\\", "_")
                        .replaceAll(":", "_")
                );

                const prefix = sanitizedSegments.join("\\");
                const testsPath = String.raw`${prefix}\TeStS\file.ts`;
                const underscoreTestsPath = `${prefix}/__TeStS__/file.ts`;

                expect(isTestFilePath(testsPath)).toBeTruthy();
                expect(isTestFilePath(underscoreTestsPath)).toBeTruthy();
            }
        )
    );
};

/**
 * Helper utility for assert non test paths.
 *
 * @returns AssertNonTestPaths helper result.
 */

const assertNonTestPaths = (): void => {
    expect(
        isTestFilePath("src/rules/prefer-type-fest-json-value.ts")
    ).toBeFalsy();
    expect(isTestFilePath("src/_internal/typed-rule.ts")).toBeFalsy();
    expect(
        isTestFilePath("docs/rules/prefer-type-fest-json-array.md")
    ).toBeFalsy();
    expect(isTestFilePath("src/tests-helper.ts")).toBeFalsy();
};

interface ParserServicesLike {
    esTreeNodeToTSNodeMap: WeakMap<object, object>;
    program: null | ts.Program;
    tsNodeToESTreeNodeMap: WeakMap<object, object>;
}

/**
 * CreateTypedRuleContext helper.
 *
 * @param parserServices - Value to inspect.
 *
 * @returns CreateTypedRuleContext helper result.
 */

const createTypedRuleContext = (
    parserServices: Readonly<ParserServicesLike>
) => ({
    languageOptions: {
        parser: {
            meta: {
                name: "@typescript-eslint/parser",
            },
        },
    },
    sourceCode: {
        parserServices,
    },
});

/**
 * CreateParserServices helper.
 *
 * @param program - Value to inspect.
 *
 * @returns CreateParserServices helper result.
 */

const createParserServices = (
    program: Readonly<null | ts.Program>
): ParserServicesLike => ({
    esTreeNodeToTSNodeMap: new WeakMap<object, object>(),
    program,
    tsNodeToESTreeNodeMap: new WeakMap<object, object>(),
});

describe(isTestFilePath, () => {
    it("accepts known test suffixes regardless of filename casing", () => {
        expect.hasAssertions();

        assertKnownSuffixesProperty();
    });

    it("accepts paths containing tests directories with mixed separators/casing", () => {
        expect.hasAssertions();

        assertTestsDirectoryProperty();
    });

    it("rejects non-test paths", () => {
        expect.hasAssertions();

        assertNonTestPaths();
    });
});

describe(isGlobalUndefinedIdentifier, () => {
    const createScope = ({
        defsLength,
        upper,
    }: Readonly<{
        defsLength?: number;
        upper?: null | Readonly<TSESLint.Scope.Scope>;
    }>): Readonly<TSESLint.Scope.Scope> => {
        const variableEntries =
            defsLength === undefined
                ? []
                : [
                      [
                          "undefined",
                          {
                              defs: Array.from(
                                  { length: defsLength },
                                  () => ({}) as TSESLint.Scope.Definition
                              ),
                          } as TSESLint.Scope.Variable,
                      ] as const,
                  ];

        return {
            set: new Map(variableEntries),
            upper: upper ?? null,
        } as TSESLint.Scope.Scope;
    };

    const createContextWithScope = (
        scopeFactory: () => Readonly<TSESLint.Scope.Scope>
    ): Readonly<TSESLint.RuleContext<string, readonly unknown[]>> =>
        ({
            sourceCode: {
                getScope: () => scopeFactory(),
            },
        }) as unknown as TSESLint.RuleContext<string, readonly unknown[]>;

    const undefinedIdentifierExpression = {
        name: "undefined",
        type: "Identifier",
    } as unknown as TSESTree.Expression;

    const undefinedLiteralExpression = {
        raw: '"undefined"',
        type: "Literal",
        value: "undefined",
    } as unknown as TSESTree.Expression;

    it("returns true for identifier references resolved to global undefined", () => {
        const context = createContextWithScope(() => createScope({}));

        expect(
            isGlobalUndefinedIdentifier(context, undefinedIdentifierExpression)
        ).toBeTruthy();
    });

    it("returns false when undefined is shadowed with local definitions", () => {
        const context = createContextWithScope(() =>
            createScope({
                defsLength: 1,
            })
        );

        expect(
            isGlobalUndefinedIdentifier(context, undefinedIdentifierExpression)
        ).toBeFalsy();
    });

    it("walks parent scopes when current scope does not define undefined", () => {
        const context = createContextWithScope(() =>
            createScope({
                upper: createScope({
                    defsLength: 0,
                }),
            })
        );

        expect(
            isGlobalUndefinedIdentifier(context, undefinedIdentifierExpression)
        ).toBeTruthy();
    });

    it("returns false when sourceCode.getScope throws", () => {
        const context = {
            sourceCode: {
                getScope: () => {
                    throw new TypeError("scope failure");
                },
            },
        } as unknown as TSESLint.RuleContext<string, readonly unknown[]>;

        expect(
            isGlobalUndefinedIdentifier(context, undefinedIdentifierExpression)
        ).toBeFalsy();
    });

    it("returns false for non-identifier expressions", () => {
        const context = createContextWithScope(() => createScope({}));

        expect(
            isGlobalUndefinedIdentifier(context, undefinedLiteralExpression)
        ).toBeFalsy();
    });
});

describe(isGlobalIdentifierNamed, () => {
    const createScopeWithBinding = ({
        defsLength,
        identifierName,
    }: Readonly<{
        defsLength: number;
        identifierName: string;
    }>): Readonly<TSESLint.Scope.Scope> =>
        ({
            set: new Map([
                [
                    identifierName,
                    {
                        defs: Array.from(
                            { length: defsLength },
                            () => ({}) as TSESLint.Scope.Definition
                        ),
                    } as TSESLint.Scope.Variable,
                ],
            ]),
            upper: null,
        }) as TSESLint.Scope.Scope;

    const createContextWithScope = (
        scope: Readonly<TSESLint.Scope.Scope>
    ): Readonly<TSESLint.RuleContext<string, readonly unknown[]>> =>
        ({
            sourceCode: {
                getScope: () => scope,
            },
        }) as unknown as TSESLint.RuleContext<string, readonly unknown[]>;

    it("returns true for unshadowed global-like identifier references", () => {
        const context = createContextWithScope(
            createScopeWithBinding({
                defsLength: 0,
                identifierName: "Infinity",
            })
        );

        expect(
            isGlobalIdentifierNamed(
                context,
                {
                    name: "Infinity",
                    type: "Identifier",
                } as unknown as TSESTree.Expression,
                "Infinity"
            )
        ).toBeTruthy();
    });

    it("returns false for shadowed identifier references", () => {
        const context = createContextWithScope(
            createScopeWithBinding({
                defsLength: 1,
                identifierName: "Infinity",
            })
        );

        expect(
            isGlobalIdentifierNamed(
                context,
                {
                    name: "Infinity",
                    type: "Identifier",
                } as unknown as TSESTree.Expression,
                "Infinity"
            )
        ).toBeFalsy();
    });
});

describe(isTypeAssignableTo, () => {
    const sourceType = {} as ts.Type;
    const targetType = {} as ts.Type;

    it("uses checker.isTypeAssignableTo when available", () => {
        const isTypeAssignableToMock = vi
            .fn<
                (
                    source: Readonly<ts.Type>,
                    target: Readonly<ts.Type>
                ) => boolean
            >()
            .mockReturnValue(true);

        const checker = {
            isTypeAssignableTo: isTypeAssignableToMock,
        } as unknown as ts.TypeChecker;

        expect(
            isTypeAssignableTo(checker, sourceType, targetType)
        ).toBeTruthy();
        expect(isTypeAssignableToMock).toHaveBeenCalledWith(
            sourceType,
            targetType
        );
    });

    it("falls back to strict identity when native assignability API is unavailable", () => {
        const checker = {
            typeToString: vi.fn<(type: Readonly<ts.Type>) => string>(),
        } as unknown as ts.TypeChecker;

        expect(
            isTypeAssignableTo(checker, sourceType, sourceType)
        ).toBeTruthy();
    });

    it("fails gracefully and falls back to identity when native assignability API throws", () => {
        const checker = {
            isTypeAssignableTo: vi
                .fn<
                    (
                        source: Readonly<ts.Type>,
                        target: Readonly<ts.Type>
                    ) => boolean
                >()
                .mockImplementation(() => {
                    throw new TypeError("checker failure");
                }),
            typeToString: vi.fn<(type: Readonly<ts.Type>) => string>(),
        } as unknown as ts.TypeChecker;

        expect(
            isTypeAssignableTo(checker, sourceType, sourceType)
        ).toBeTruthy();
        expect(isTypeAssignableTo(checker, sourceType, targetType)).toBeFalsy();
    });

    it("returns false for non-identical types when assignability API is unavailable", () => {
        const checker = {
            typeToString: vi.fn<(type: Readonly<ts.Type>) => string>(),
        } as unknown as ts.TypeChecker;

        expect(isTypeAssignableTo(checker, sourceType, targetType)).toBeFalsy();
    });
});

describe(createTypedRule, () => {
    type RuleMessageIds = "blocked";

    const createFixOnlyRule = (): ReturnType<typeof createTypedRule> =>
        createTypedRule({
            create(context) {
                return {
                    Program(node) {
                        context.report({
                            fix: (fixer) => fixer.insertTextAfter(node, "\n"),
                            messageId: "blocked",
                            node,
                        });
                    },
                };
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal test rule",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-autofix-gating-test-rule",
        });

    const createSuggestOnlyRule = (): ReturnType<typeof createTypedRule> =>
        createTypedRule({
            create(context) {
                return {
                    Program(node) {
                        context.report({
                            messageId: "blocked",
                            node,
                            suggest: [
                                {
                                    fix: (fixer) =>
                                        fixer.insertTextAfter(node, "\n"),
                                    messageId: "blocked",
                                },
                            ],
                        });
                    },
                };
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal test rule",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-suggest-gating-test-rule",
        });

    const createRuleContext = ({
        report,
        settings,
    }: Readonly<{
        report: TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"];
        settings: unknown;
    }>): TSESLint.RuleContext<RuleMessageIds, UnknownArray> =>
        ({
            filename: "test-file.ts",
            id: "internal-autofix-gating-test-rule",
            languageOptions: {
                parser: {
                    meta: {
                        name: "@typescript-eslint/parser",
                    },
                },
            },
            options: [],
            report,
            settings,
            sourceCode: {
                ast: {
                    body: [],
                    comments: [],
                    range: [0, 0],
                    sourceType: "module",
                    tokens: [],
                    type: "Program",
                },
            },
        }) as unknown as TSESLint.RuleContext<RuleMessageIds, UnknownArray>;

    it("keeps fix callbacks when disableAllAutofixes is not enabled", () => {
        const reportSpy =
            vi.fn<
                TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"]
            >();
        const context = createRuleContext({
            report: reportSpy,
            settings: {},
        });

        const ruleUnderTest = createFixOnlyRule();
        const listeners = ruleUnderTest.create(
            context as unknown as TSESLint.RuleContext<RuleMessageIds, []>
        );

        listeners.Program?.(
            context.sourceCode.ast as unknown as TSESTree.Program
        );

        expect(reportSpy).toHaveBeenCalledTimes(1);

        const [descriptor] = reportSpy.mock.calls[0] as [
            TSESLint.ReportDescriptor<RuleMessageIds>,
        ];

        expect(descriptor.fix).toBeTypeOf("function");
    });

    it("removes fix callbacks while keeping suggestions when disableAllAutofixes is enabled", () => {
        const reportSpy =
            vi.fn<
                TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"]
            >();
        const context = createRuleContext({
            report: reportSpy,
            settings: {
                typefest: {
                    disableAllAutofixes: true,
                },
            },
        });

        const ruleUnderTest = createSuggestOnlyRule();
        const listeners = ruleUnderTest.create(
            context as unknown as TSESLint.RuleContext<RuleMessageIds, []>
        );

        listeners.Program?.(
            context.sourceCode.ast as unknown as TSESTree.Program
        );

        expect(reportSpy).toHaveBeenCalledTimes(1);

        const [descriptor] = reportSpy.mock.calls[0] as [
            TSESLint.ReportDescriptor<RuleMessageIds>,
        ];

        expect(descriptor.fix).toBeUndefined();
        expect(descriptor.suggest).toHaveLength(1);
    });

    it("strips top-level fix but preserves suggestions when both are present", () => {
        const reportSpy =
            vi.fn<
                TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"]
            >();
        const context = createRuleContext({
            report: reportSpy,
            settings: {
                typefest: {
                    disableAllAutofixes: true,
                },
            },
        });

        const ruleUnderTest = createTypedRule({
            create(ruleContext) {
                return {
                    Program(node) {
                        ruleContext.report({
                            fix: (fixer) => fixer.insertTextAfter(node, "\n"),
                            messageId: "blocked",
                            node,
                            suggest: [
                                {
                                    fix: (fixer) =>
                                        fixer.insertTextAfter(node, "\n"),
                                    messageId: "blocked",
                                },
                            ],
                        });
                    },
                };
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal test rule",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-combined-fix-suggest-test-rule",
        });

        const listeners = ruleUnderTest.create(
            context as unknown as TSESLint.RuleContext<RuleMessageIds, []>
        );

        listeners.Program?.(
            context.sourceCode.ast as unknown as TSESTree.Program
        );

        expect(reportSpy).toHaveBeenCalledTimes(1);

        const [descriptor] = reportSpy.mock.calls[0] as [
            TSESLint.ReportDescriptor<RuleMessageIds>,
        ];

        expect(descriptor.fix).toBeUndefined();
        expect(descriptor.suggest).toHaveLength(1);
    });

    it("does not mutate original report descriptor when stripping fix", () => {
        const reportSpy =
            vi.fn<
                TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"]
            >();
        const context = createRuleContext({
            report: reportSpy,
            settings: {
                typefest: {
                    disableAllAutofixes: true,
                },
            },
        });

        let originalDescriptor:
            | TSESLint.ReportDescriptor<RuleMessageIds>
            | undefined = undefined;

        const ruleUnderTest = createTypedRule({
            create(ruleContext) {
                return {
                    Program(node) {
                        originalDescriptor = {
                            fix: (fixer) => fixer.insertTextAfter(node, "\n"),
                            messageId: "blocked",
                            node,
                        };

                        ruleContext.report(originalDescriptor);
                    },
                };
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal test rule",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-descriptor-mutation-test-rule",
        });

        const listeners = ruleUnderTest.create(
            context as unknown as TSESLint.RuleContext<RuleMessageIds, []>
        );

        listeners.Program?.(
            context.sourceCode.ast as unknown as TSESTree.Program
        );

        expect(reportSpy).toHaveBeenCalledTimes(1);
        expect(originalDescriptor).toBeDefined();

        const ensuredDescriptor =
            originalDescriptor as unknown as TSESLint.ReportDescriptor<RuleMessageIds>;

        expect(Object.hasOwn(ensuredDescriptor, "fix")).toBeTruthy();
    });

    it("does not strip non-function fix values", () => {
        const reportSpy =
            vi.fn<
                TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"]
            >();
        const context = createRuleContext({
            report: reportSpy,
            settings: {
                typefest: {
                    disableAllAutofixes: true,
                },
            },
        });

        const ruleUnderTest = createTypedRule({
            create(ruleContext) {
                return {
                    Program(node) {
                        ruleContext.report({
                            fix: null,
                            messageId: "blocked",
                            node,
                        } as unknown as TSESLint.ReportDescriptor<RuleMessageIds>);
                    },
                };
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal test rule",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-non-function-fix-test-rule",
        });

        const listeners = ruleUnderTest.create(
            context as unknown as TSESLint.RuleContext<RuleMessageIds, []>
        );

        listeners.Program?.(
            context.sourceCode.ast as unknown as TSESTree.Program
        );

        expect(reportSpy).toHaveBeenCalledTimes(1);

        const [descriptor] = reportSpy.mock.calls[0] as [
            TSESLint.ReportDescriptor<RuleMessageIds>,
        ];

        expect(descriptor.fix).toBeNull();
    });

    it("falls back safely when fix descriptor lookup returns undefined", () => {
        const reportSpy =
            vi.fn<
                TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"]
            >();
        const context = createRuleContext({
            report: reportSpy,
            settings: {
                typefest: {
                    disableAllAutofixes: true,
                },
            },
        });

        const ruleUnderTest = createTypedRule({
            create(ruleContext) {
                return {
                    Program(node) {
                        let fixDescriptorLookups = 0;

                        const descriptorTarget = {
                            messageId: "blocked",
                            node,
                        };

                        const descriptorWithVolatileFix = new Proxy(
                            descriptorTarget,
                            {
                                getOwnPropertyDescriptor(target, property) {
                                    if (property !== "fix") {
                                        return Reflect.getOwnPropertyDescriptor(
                                            target,
                                            property
                                        );
                                    }

                                    fixDescriptorLookups += 1;

                                    if (fixDescriptorLookups === 1) {
                                        return {
                                            configurable: true,
                                            enumerable: true,
                                            value: () => null,
                                            writable: true,
                                        };
                                    }

                                    return undefined;
                                },
                            }
                        ) as unknown as TSESLint.ReportDescriptor<RuleMessageIds>;

                        ruleContext.report(descriptorWithVolatileFix);
                    },
                };
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal test rule",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-volatile-fix-descriptor-test-rule",
        });

        const listeners = ruleUnderTest.create(
            context as unknown as TSESLint.RuleContext<RuleMessageIds, []>
        );

        expect(() =>
            listeners.Program?.(
                context.sourceCode.ast as unknown as TSESTree.Program
            )
        ).not.toThrowError();
        expect(reportSpy).toHaveBeenCalledTimes(1);
    });

    it("does not crash when fix getter throws", () => {
        const reportSpy =
            vi.fn<
                TSESLint.RuleContext<RuleMessageIds, UnknownArray>["report"]
            >();
        const context = createRuleContext({
            report: reportSpy,
            settings: {
                typefest: {
                    disableAllAutofixes: true,
                },
            },
        });

        const ruleUnderTest = createTypedRule({
            create(ruleContext) {
                return {
                    Program(node) {
                        const descriptor = {
                            messageId: "blocked",
                            node,
                        } as TSESLint.ReportDescriptor<RuleMessageIds>;

                        const fixGetter = vi.fn(() => {
                            throw new TypeError("boom");
                        });

                        Object.defineProperty(descriptor, "fix", {
                            get: fixGetter,
                        });

                        ruleContext.report(descriptor);

                        expect(fixGetter).not.toHaveBeenCalled();
                    },
                };
            },
            defaultOptions: [],
            meta: {
                docs: {
                    description: "internal test rule",
                    recommended: false,
                },
                messages: {
                    blocked: "blocked",
                },
                schema: [],
                type: "problem",
            },
            name: "internal-throwing-fix-getter-test-rule",
        });

        const listeners = ruleUnderTest.create(
            context as unknown as TSESLint.RuleContext<RuleMessageIds, []>
        );

        expect(() =>
            listeners.Program?.(
                context.sourceCode.ast as unknown as TSESTree.Program
            )
        ).not.toThrowError();
        expect(reportSpy).toHaveBeenCalledTimes(1);
    });
});

describe(getTypedRuleServices, () => {
    it("returns parser services and type checker when program is available", () => {
        const checker = {} as ts.TypeChecker;
        const parserServices = createParserServices({
            getTypeChecker: () => checker,
        } as ts.Program);

        const context = createTypedRuleContext(parserServices);

        const result = getTypedRuleServices(context as never);

        expect(result.parserServices).toBe(parserServices);
        expect(result.checker).toBe(checker);
    });

    it("throws when parser services do not expose a TypeScript program", () => {
        const parserServices = createParserServices(null);

        const context = createTypedRuleContext(parserServices);

        expect(() => getTypedRuleServices(context as never)).toThrowError(
            /requires parserServices\.program/v
        );
    });
});

describe(getSignatureParameterTypeAt, () => {
    const location = {} as ts.Node;

    it("returns undefined when the parameter index is out of range", () => {
        const checker = {
            getTypeOfSymbolAtLocation: vi.fn(),
        } as unknown as ts.TypeChecker;
        const signature = {
            parameters: [],
        } as unknown as ts.Signature;

        expect(
            getSignatureParameterTypeAt({
                checker,
                index: 0,
                location,
                signature,
            })
        ).toBeUndefined();
    });

    it("delegates to checker.getTypeOfSymbolAtLocation when parameter exists", () => {
        const parameter = {} as ts.Symbol;
        const signature = {
            parameters: [parameter],
        } as unknown as ts.Signature;
        const expectedType = {} as ts.Type;

        const checkerWithSpy = {
            getTypeOfSymbolAtLocation: vi.fn().mockReturnValue(expectedType),
        } as unknown as ts.TypeChecker;

        expect(
            getSignatureParameterTypeAt({
                checker: checkerWithSpy,
                index: 0,
                location,
                signature,
            })
        ).toBe(expectedType);
        expect(checkerWithSpy.getTypeOfSymbolAtLocation).toHaveBeenCalledWith(
            parameter,
            location
        );
    });
});
