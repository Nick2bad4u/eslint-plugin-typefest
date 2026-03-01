import type { TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-equal-type.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-equal-type.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-equal-type.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const invalidFixtureCodeWithTsExtrasImport = invalidFixtureCode.replace(
    'import type { IsEqual } from "type-fest";\r\n',
    'import type { IsEqual } from "type-fest";\nimport { isEqualType } from "ts-extras";\r\n'
);
const invalidFixtureDirectEqualSuggestionOutput =
    invalidFixtureCodeWithTsExtrasImport.replace(
        "const directEqualCheck: IsEqual<string, string> = true;",
        "const directEqualCheck = isEqualType<string, string>() || true;"
    );
const invalidFixtureDirectUnequalSuggestionOutput =
    invalidFixtureCodeWithTsExtrasImport.replace(
        "const directUnequalCheck: IsEqual<number, string> = false;",
        "const directUnequalCheck = isEqualType<number, string>() && false;"
    );
const invalidFixtureNamespaceSuggestionOutput =
    invalidFixtureCodeWithTsExtrasImport.replace(
        'const namespaceEqualCheck: TypeFest.IsEqual<"a", "a"> = true;',
        'const namespaceEqualCheck = isEqualType<"a", "a">() || true;'
    );
const inlineInvalidAliasedImportCode = [
    'import type { IsEqual as IsEqualAlias } from "type-fest";',
    "",
    "const aliasedEqualCheck: IsEqualAlias<string, string> = true;",
    "",
    "Boolean(aliasedEqualCheck);",
].join("\n");
const inlineInvalidAliasedImportSuggestionOutput =
    inlineInvalidAliasedImportCode
        .replace(
            'import type { IsEqual as IsEqualAlias } from "type-fest";',
            'import type { IsEqual as IsEqualAlias } from "type-fest";\nimport { isEqualType } from "ts-extras";'
        )
        .replace(
            "const aliasedEqualCheck: IsEqualAlias<string, string> = true;",
            "const aliasedEqualCheck = isEqualType<string, string>() || true;"
        );
const inlineInvalidAliasedTsExtrasImportCode = [
    'import { isEqualType as isEqualTypeAlias } from "ts-extras";',
    'import type { IsEqual } from "type-fest";',
    "",
    "const aliasedRuntimeHelperCheck: IsEqual<string, string> = true;",
    "",
    "Boolean(aliasedRuntimeHelperCheck);",
].join("\n");
const inlineInvalidAliasedTsExtrasImportSuggestionOutput =
    inlineInvalidAliasedTsExtrasImportCode.replace(
        "const aliasedRuntimeHelperCheck: IsEqual<string, string> = true;",
        "const aliasedRuntimeHelperCheck = isEqualTypeAlias<string, string>() || true;"
    );
const inlineValidTypeAliasReferenceCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "type EqualityFlag = IsEqual<string, string>;",
    "const equalityFlag: EqualityFlag = true;",
    "",
    "Boolean(equalityFlag);",
].join("\n");
const inlineValidNonBooleanInitializerCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const equalityFlag: IsEqual<string, string> = true as const;",
    "",
    "Boolean(equalityFlag);",
].join("\n");
const inlineValidNonBooleanLiteralInitializerCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const nonBooleanLiteralCheck: IsEqual<string, string> = 1;",
    "",
    "Boolean(nonBooleanLiteralCheck);",
].join("\n");
const inlineValidObjectPatternDeclaratorCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const { equalityFlag }: { equalityFlag: IsEqual<string, string> } = {",
    "    equalityFlag: true,",
    "};",
    "",
    "Boolean(equalityFlag);",
].join("\n");
const inlineValidNamespaceNonIsEqualCode = [
    'import type * as TypeFest from "type-fest";',
    "",
    'const value: TypeFest.Promisable<string> = "monitor";',
    "",
    "Boolean(value);",
].join("\n");
const inlineInvalidWithoutTypeArgumentsCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const noTypeArgumentsCheck: IsEqual = true;",
    "",
    "Boolean(noTypeArgumentsCheck);",
].join("\n");
const inlineInvalidSingleTypeArgumentCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const oneTypeArgumentCheck: IsEqual<string> = true;",
    "",
    "Boolean(oneTypeArgumentCheck);",
].join("\n");
const inlineInvalidThreeTypeArgumentsCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const threeTypeArgumentsCheck: IsEqual<string, string, boolean> = true;",
    "",
    "Boolean(threeTypeArgumentsCheck);",
].join("\n");
const inlineInvalidWithConflictingIsEqualTypeBindingCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const isEqualType = (left: unknown, right: unknown): boolean => left === right;",
    "const conflictingBindingCheck: IsEqual<string, string> = true;",
    "",
    "Boolean(conflictingBindingCheck);",
].join("\n");
const inlineValidUnionBooleanTypeCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const unionFlag: false | true = true;",
    "",
    "Boolean(unionFlag);",
].join("\n");
const inlineValidNamespaceBooleanNonIsEqualCode = [
    'import type * as TypeFest from "type-fest";',
    "",
    "const namespaceBoolean: TypeFest.Promisable<boolean> = true;",
    "",
    "Boolean(namespaceBoolean);",
].join("\n");
const inlineValidNamedImportBooleanNonIsEqualCode = [
    'import type { Promisable } from "type-fest";',
    "",
    "const namedImportBoolean: Promisable<boolean> = true;",
    "",
    "Boolean(namedImportBoolean);",
].join("\n");
const inlineValidNonTypeFestIsEqualImportCode = [
    'import type { IsEqual } from "ts-extras";',
    "",
    "const externalEqualCheck: IsEqual<string, string> = true;",
    "",
    "Boolean(externalEqualCheck);",
].join("\n");
const inlineValidLocalNamespaceIsEqualCode = [
    "declare namespace LocalTypes {",
    "    type IsEqual<Left, Right> = boolean;",
    "}",
    "",
    "const localNamespaceCheck: LocalTypes.IsEqual<string, string> = true;",
    "",
    "Boolean(localNamespaceCheck);",
].join("\n");
const disableAllAutofixesSettings = {
    typefest: {
        disableAllAutofixes: true,
    },
};

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type IsEqualFixFactoryArguments = Readonly<{
    replacementTextFactory: (replacementName: string) => string;
    targetNode: unknown;
}>;
type IsEqualImportKind = "namedImport" | "namespaceImport";

type IsEqualPair = Readonly<{
    leftTypeText: string;
    rightTypeText: string;
}>;

type IsEqualPairId = "booleans" | "numbers" | "stringLiterals";

type IsEqualReportDescriptor = Readonly<{
    messageId?: string;
    suggest?: readonly Readonly<{
        fix?: unknown;
        messageId?: string;
    }>[];
}>;

const isEqualImportKindArbitrary = fc.constantFrom<IsEqualImportKind>(
    "namedImport",
    "namespaceImport"
);
const isEqualPairIdArbitrary = fc.constantFrom<IsEqualPairId>(
    "booleans",
    "numbers",
    "stringLiterals"
);

const buildIsEqualPair = (pairId: IsEqualPairId): IsEqualPair => {
    if (pairId === "booleans") {
        return {
            leftTypeText: "true",
            rightTypeText: "boolean",
        };
    }

    if (pairId === "numbers") {
        return {
            leftTypeText: "number",
            rightTypeText: "42",
        };
    }

    return {
        leftTypeText: '"alpha"',
        rightTypeText: '"alpha"',
    };
};

const buildIsEqualVariableCode = (options: {
    readonly importKind: IsEqualImportKind;
    readonly includeAliasedTsExtrasImport: boolean;
    readonly includeUnicodeBanner: boolean;
    readonly initializerValue: boolean;
    readonly pairId: IsEqualPairId;
    readonly variableName: string;
}): string => {
    const pair = buildIsEqualPair(options.pairId);
    const isEqualReferenceText =
        options.importKind === "namespaceImport"
            ? `TypeFest.IsEqual<${pair.leftTypeText}, ${pair.rightTypeText}>`
            : `IsEqual<${pair.leftTypeText}, ${pair.rightTypeText}>`;
    const isEqualImportText =
        options.importKind === "namespaceImport"
            ? 'import type * as TypeFest from "type-fest";'
            : 'import type { IsEqual } from "type-fest";';

    const codeLines = [
        options.includeAliasedTsExtrasImport
            ? 'import { isEqualType as isEqualTypeAlias } from "ts-extras";'
            : "",
        isEqualImportText,
        "",
        options.includeUnicodeBanner
            ? 'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
            : "",
        `const ${options.variableName}: ${isEqualReferenceText} = ${String(options.initializerValue)};`,
        "",
        `Boolean(${options.variableName});`,
    ];

    return codeLines.filter((line) => line.length > 0).join("\n");
};

const getSourceTextForNode = (options: {
    readonly code: string;
    readonly node: unknown;
}): string => {
    if (typeof options.node !== "object" || options.node === null) {
        return "";
    }

    const maybeRange = (
        options.node as Readonly<{
            range?: readonly [number, number];
        }>
    ).range;

    if (!maybeRange) {
        return "";
    }

    return options.code.slice(maybeRange[0], maybeRange[1]);
};

const parseIsEqualDeclaratorFromCode = (
    code: string
): Readonly<{
    ast: TSESTree.Program;
    variableDeclarator: TSESTree.VariableDeclarator;
}> => {
    const ast = parser.parseForESLint(code, parserOptions)
        .ast as TSESTree.Program;

    for (const statement of ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (
                    declaration.id.type === AST_NODE_TYPES.Identifier &&
                    declaration.id.typeAnnotation?.typeAnnotation?.type ===
                        AST_NODE_TYPES.TSTypeReference &&
                    declaration.init?.type === AST_NODE_TYPES.Literal
                ) {
                    return {
                        ast,
                        variableDeclarator: declaration,
                    };
                }
            }
        }
    }

    throw new Error(
        "Expected an IsEqual variable declarator in generated code"
    );
};

interface IsEqualTypeRuleMetadataSnapshot {
    defaultOptions?: Readonly<UnknownArray>;
    meta?: {
        docs?: {
            description?: string;
            url?: string;
        };
        hasSuggestions?: boolean;
        messages?: Record<string, string>;
        schema?: Readonly<UnknownArray>;
        type?: string;
    };
    name?: string;
}

const loadIsEqualTypeRuleMetadata =
    async (): Promise<IsEqualTypeRuleMetadataSnapshot> => {
        const moduleUnderTest =
            await import("../src/rules/prefer-ts-extras-is-equal-type");

        return moduleUnderTest.default as IsEqualTypeRuleMetadataSnapshot;
    };

describe("prefer-ts-extras-is-equal-type metadata", () => {
    it("exposes stable report and suggestion messages", async () => {
        const metadataRule = await loadIsEqualTypeRuleMetadata();
        const metadataDefaultOptions =
            "defaultOptions" in metadataRule
                ? (metadataRule as { defaultOptions?: unknown }).defaultOptions
                : undefined;

        expect(metadataRule.name).toBe("prefer-ts-extras-is-equal-type");
        expect(metadataDefaultOptions).toStrictEqual([]);
        expect(metadataRule.meta?.docs?.description).toBe(
            "require ts-extras isEqualType over IsEqual<T, U> boolean assertion variables."
        );
        expect(metadataRule.meta?.docs?.url).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-equal-type"
        );
        expect(metadataRule.meta?.hasSuggestions).toBeTruthy();
        expect(metadataRule.meta?.messages?.["preferTsExtrasIsEqualType"]).toBe(
            "Prefer `isEqualType<T, U>()` from `ts-extras` over `IsEqual<T, U>` boolean assertion variables."
        );
        expect(
            metadataRule.meta?.messages?.["suggestTsExtrasIsEqualType"]
        ).toBe(
            "Replace this boolean `IsEqual<...>` assertion variable with `isEqualType<...>()`."
        );
        expect(metadataRule.meta?.schema).toStrictEqual([]);
        expect(metadataRule.meta?.type).toBe("suggestion");
    });

    it("declares authored literals before RuleCreator decoration", async () => {
        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
            }));

            const undecoratedRule =
                (await import("../src/rules/prefer-ts-extras-is-equal-type")) as {
                    default: IsEqualTypeRuleMetadataSnapshot;
                };

            expect(undecoratedRule.default.name).toBe(
                "prefer-ts-extras-is-equal-type"
            );
            expect(undecoratedRule.default.defaultOptions).toStrictEqual([]);
            expect(undecoratedRule.default.meta?.docs?.description).toBe(
                "require ts-extras isEqualType over IsEqual<T, U> boolean assertion variables."
            );
            expect(undecoratedRule.default.meta?.docs?.url).toBe(
                "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-equal-type"
            );
            expect(undecoratedRule.default.meta?.hasSuggestions).toBeTruthy();
            expect(
                undecoratedRule.default.meta?.messages?.[
                    "preferTsExtrasIsEqualType"
                ]
            ).toBe(
                "Prefer `isEqualType<T, U>()` from `ts-extras` over `IsEqual<T, U>` boolean assertion variables."
            );
            expect(
                undecoratedRule.default.meta?.messages?.[
                    "suggestTsExtrasIsEqualType"
                ]
            ).toBe(
                "Replace this boolean `IsEqual<...>` assertion variable with `isEqualType<...>()`."
            );
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-is-equal-type source assertions", () => {
    it("keeps is-equal-type source constants and guard clauses", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-ts-extras-is-equal-type.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain('const IS_EQUAL_TYPE_NAME = "IsEqual";');
        expect(ruleSource).toContain(
            'const IS_EQUAL_TYPE_FUNCTION_NAME = "isEqualType";'
        );
        expect(ruleSource).toContain(
            'const TS_EXTRAS_PACKAGE_NAME = "ts-extras";'
        );
        expect(ruleSource).toContain(
            'const TYPE_FEST_PACKAGE_NAME = "type-fest";'
        );
        expect(ruleSource).toContain("collectNamedImportLocalNamesFromSource(");
        expect(ruleSource).toContain(
            "collectNamespaceImportLocalNamesFromSource("
        );
        expect(ruleSource).not.toContain(
            "for (const statement of context.sourceCode.ast.body) {"
        );
        expect(ruleSource).toContain(
            'node.typeName.left.type === "Identifier" &&'
        );
        expect(ruleSource).toContain(
            "typeFestNamespaceImportNames.has(node.typeName.left.name) &&"
        );
        expect(ruleSource).toContain(
            'node.typeName.right.type === "Identifier" &&'
        );
        expect(ruleSource).toContain('typeof node.init.value !== "boolean"');
        expect(ruleSource).toContain("if (!leftType || !rightType) {");
        expect(ruleSource).toContain("typeArguments.length === 2 &&");
        expect(ruleSource).toContain("hasSuggestions: true,");
    });
});

describe("prefer-ts-extras-is-equal-type internal listener guards", () => {
    it("ignores IsEqual-like references with malformed non-qualified typeName nodes", async () => {
        const report = vi.fn();

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
            }));

            vi.doMock("../src/_internal/imported-type-aliases.js", () => ({
                collectNamedImportLocalNamesFromSource: () =>
                    new Set<string>(["IsEqual"]),
                collectNamespaceImportLocalNamesFromSource: () =>
                    new Set<string>(["TypeFest"]),
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueNodeTextReplacementFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-equal-type")) as {
                    default: {
                        create: (context: unknown) => {
                            VariableDeclarator?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report,
                sourceCode: {
                    ast: {
                        body: [],
                    },
                    getText: () => "string",
                },
            });

            listeners.VariableDeclarator?.({
                id: {
                    name: "equalCheck",
                    type: "Identifier",
                    typeAnnotation: {
                        typeAnnotation: {
                            type: "TSTypeReference",
                            typeName: {
                                type: "TSImportType",
                            },
                        },
                    },
                },
                init: {
                    type: "Literal",
                    value: true,
                },
                type: "VariableDeclarator",
            });

            expect(report).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-is-equal-type fast-check fix safety", () => {
    it("fast-check: IsEqual boolean assertions expose parseable isEqualType suggestions", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueNodeTextReplacementFixMock = vi.fn(
                (options: IsEqualFixFactoryArguments): string => {
                    if (typeof options.replacementTextFactory !== "function") {
                        throw new TypeError(
                            "Expected replacementTextFactory to be callable"
                        );
                    }

                    return "FIX";
                }
            );

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
            }));

            vi.doMock("../src/_internal/imported-type-aliases.js", () => ({
                collectNamedImportLocalNamesFromSource: () =>
                    new Set(["IsEqual"]),
                collectNamespaceImportLocalNamesFromSource: () =>
                    new Set(["TypeFest"]),
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueNodeTextReplacementFix:
                    createSafeValueNodeTextReplacementFixMock,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-equal-type")) as {
                    default: {
                        create: (context: unknown) => {
                            VariableDeclarator?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    isEqualImportKindArbitrary,
                    isEqualPairIdArbitrary,
                    fc.boolean(),
                    fc.boolean(),
                    fc.constantFrom(
                        "equalCheck",
                        "runtimeTypeMatch",
                        "schemaTypeGuard"
                    ),
                    (
                        importKind,
                        pairId,
                        initializerValue,
                        includeUnicodeBanner,
                        variableName
                    ) => {
                        createSafeValueNodeTextReplacementFixMock.mockClear();

                        const code = buildIsEqualVariableCode({
                            importKind,
                            includeAliasedTsExtrasImport: false,
                            includeUnicodeBanner,
                            initializerValue,
                            pairId,
                            variableName,
                        });
                        const { ast, variableDeclarator } =
                            parseIsEqualDeclaratorFromCode(code);
                        const reportCalls: IsEqualReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (descriptor: IsEqualReportDescriptor) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.VariableDeclarator?.(variableDeclarator);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]?.messageId).toBe(
                            "preferTsExtrasIsEqualType"
                        );
                        expect(reportCalls[0]?.suggest).toHaveLength(1);
                        expect(reportCalls[0]?.suggest?.[0]?.fix).toBe("FIX");
                        expect(
                            createSafeValueNodeTextReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const annotationNode =
                            variableDeclarator.id.typeAnnotation;

                        expect(annotationNode).toBeDefined();

                        if (
                            annotationNode?.typeAnnotation.type !==
                            AST_NODE_TYPES.TSTypeReference
                        ) {
                            throw new Error(
                                "Expected variable declarator to use TSTypeReference"
                            );
                        }

                        const annotationArguments =
                            annotationNode.typeAnnotation.typeArguments
                                ?.params ?? [];
                        const [leftTypeNode, rightTypeNode] =
                            annotationArguments;

                        expect(leftTypeNode).toBeDefined();
                        expect(rightTypeNode).toBeDefined();

                        if (
                            leftTypeNode === undefined ||
                            rightTypeNode === undefined
                        ) {
                            throw new Error(
                                "Expected IsEqual type reference to include two type arguments"
                            );
                        }

                        const leftTypeText = getSourceTextForNode({
                            code,
                            node: leftTypeNode,
                        });
                        const rightTypeText = getSourceTextForNode({
                            code,
                            node: rightTypeNode,
                        });
                        const expectedReplacementName = "isEqualType";
                        const expectedCallText = `${expectedReplacementName}<${leftTypeText}, ${rightTypeText}>()`;
                        const expectedRuntimeExpression = initializerValue
                            ? `${expectedCallText} || true`
                            : `${expectedCallText} && false`;

                        const fixArguments =
                            createSafeValueNodeTextReplacementFixMock.mock
                                .calls[0]?.[0] ?? null;

                        expect(fixArguments).not.toBeNull();

                        const replacementText =
                            fixArguments?.replacementTextFactory?.(
                                expectedReplacementName
                            ) ?? "";

                        expect(replacementText).toBe(
                            `${variableName} = ${expectedRuntimeExpression}`
                        );

                        const declaratorRange = variableDeclarator.range;

                        expect(declaratorRange).toBeDefined();

                        if (declaratorRange === undefined) {
                            throw new Error(
                                "Expected variable declarator to expose source range"
                            );
                        }

                        const fixedCode =
                            code.slice(0, declaratorRange[0]) +
                            replacementText +
                            code.slice(declaratorRange[1]);

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrowError();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(
    "prefer-ts-extras-is-equal-type",
    getPluginRule("prefer-ts-extras-is-equal-type"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: invalidFixtureDirectEqualSuggestionOutput,
                            },
                        ],
                    },
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: invalidFixtureDirectUnequalSuggestionOutput,
                            },
                        ],
                    },
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: invalidFixtureNamespaceSuggestionOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture IsEqual variable initializers",
            },
            {
                code: inlineInvalidAliasedImportCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: inlineInvalidAliasedImportSuggestionOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports aliased IsEqual import in variable initializer",
            },
            {
                code: inlineInvalidAliasedImportCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: inlineInvalidAliasedImportSuggestionOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "preserves suggestions when disableAllAutofixes is enabled",
                settings: disableAllAutofixesSettings,
            },
            {
                code: inlineInvalidAliasedTsExtrasImportCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: inlineInvalidAliasedTsExtrasImportSuggestionOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reuses aliased ts-extras isEqualType import when present",
            },
            {
                code: inlineInvalidWithoutTypeArgumentsCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: null,
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports IsEqual usage without explicit type arguments",
            },
            {
                code: inlineInvalidSingleTypeArgumentCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: null,
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports IsEqual usage with a single type argument without suggestion",
            },
            {
                code: inlineInvalidThreeTypeArgumentsCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: null,
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports IsEqual usage with three type arguments without suggestion",
            },
            {
                code: inlineInvalidWithConflictingIsEqualTypeBindingCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: null,
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports IsEqual usage without suggestion when local isEqualType binding conflicts",
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: inlineValidTypeAliasReferenceCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores IsEqual used through type alias reference",
            },
            {
                code: inlineValidNonBooleanInitializerCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores IsEqual initializer that is not plain boolean literal",
            },
            {
                code: inlineValidNonBooleanLiteralInitializerCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores IsEqual initializer when literal value is not boolean",
            },
            {
                code: inlineValidObjectPatternDeclaratorCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores IsEqual inside object-pattern declarator",
            },
            {
                code: inlineValidNamespaceNonIsEqualCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores namespace usage of non-IsEqual type-fest type",
            },
            {
                code: inlineValidUnionBooleanTypeCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores plain boolean union type",
            },
            {
                code: inlineValidNamespaceBooleanNonIsEqualCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores namespace Promisable boolean value",
            },
            {
                code: inlineValidNamedImportBooleanNonIsEqualCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores named-import Promisable boolean value",
            },
            {
                code: inlineValidNonTypeFestIsEqualImportCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores IsEqual imports that do not originate from type-fest",
            },
            {
                code: inlineValidLocalNamespaceIsEqualCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores local namespace IsEqual references that are not type-fest imports",
            },
        ],
    }
);

