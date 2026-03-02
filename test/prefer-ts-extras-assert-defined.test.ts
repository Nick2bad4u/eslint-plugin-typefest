/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-assert-defined.test` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-assert-defined");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-assert-defined.valid.ts";
const invalidFixtureName = "prefer-ts-extras-assert-defined.invalid.ts";
const undefinedOnLeftInvalidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (undefined === value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const looseEqualityInvalidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value == undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineInvalidDirectThrowConsequentCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined)",
    "        throw new TypeError('Missing value');",
    "",
    "    return value;",
    "}",
].join("\n");
const nonUndefinedValidCode = [
    "function ensureValue(value: string | undefined): string | undefined {",
    "    if (value === null) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const nonThrowOnlyValidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        String(value);",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const nonThrowSingleStatementBlockValidCode = [
    "function ensureValue(value: string | undefined): string | undefined {",
    "    if (value === undefined) {",
    "        String(value);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const throwThenSideEffectValidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Missing value');",
    "        String(value);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const alternateValidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    } else {",
    "        String(value);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const nonBinaryGuardValidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (!value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const emptyConsequentValidCode = [
    "function ensureValue(value: string | undefined): string | undefined {",
    "    if (value === undefined);",
    "",
    "    return value;",
    "}",
].join("\n");
const shadowedUndefinedBindingValidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    const undefined = 'sentinel';",
    "",
    "    if (value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableCode = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableWrongConstructorCode = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new Error('Expected a defined value, got `undefined`');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableTooManyArgsCode = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Expected a defined value, got `undefined`', value);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableSpreadArgumentCode = [
    'import { assertDefined } from "ts-extras";',
    "",
    "const messageParts = ['Expected a defined value, got `undefined`'];",
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError(...messageParts);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineAutofixableDirectThrowCanonicalCode = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) throw new TypeError('Expected a defined value, got `undefined`');",
    "",
    "    return value;",
    "}",
].join("\n");
const shadowedTypeErrorSuggestableCode = [
    'import { assertDefined } from "ts-extras";',
    "",
    "class TypeError extends Error {}",
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Expected a defined value, got `undefined`');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const shadowedTypeErrorSuggestableOutput = [
    'import { assertDefined } from "ts-extras";',
    "",
    "class TypeError extends Error {}",
    "",
    "function ensureValue(value: string | undefined): string {",
    "    assertDefined(value);",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableOutput = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    assertDefined(value);",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableSpreadArgumentOutput = [
    'import { assertDefined } from "ts-extras";',
    "",
    "const messageParts = ['Expected a defined value, got `undefined`'];",
    "",
    "function ensureValue(value: string | undefined): string {",
    "    assertDefined(value);",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineAutofixableCanonicalCode = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Expected a defined value, got `undefined`');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineAutofixableCanonicalOutput = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    assertDefined(value);",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineAutofixableCanonicalUnicodeRichCode = [
    'import { assertDefined } from "ts-extras";',
    "",
    'const glyphBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";',
    "",
    "function ensureValue(候補値: string | undefined): string {",
    "    if (候補値 === undefined) {",
    "        throw new TypeError('Expected a defined value, got `undefined`');",
    "    }",
    "",
    "    return 候補値;",
    "}",
    "",
    "String(glyphBanner);",
].join("\n");
const inlineAutofixableCanonicalUnicodeRichOutput = [
    'import { assertDefined } from "ts-extras";',
    "",
    'const glyphBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";',
    "",
    "function ensureValue(候補値: string | undefined): string {",
    "    assertDefined(候補値);",
    "",
    "    return 候補値;",
    "}",
    "",
    "String(glyphBanner);",
].join("\n");
const inlineInvalidSuggestionOutputCode = [
    'import { assertDefined } from "ts-extras";',
    "function ensureValue(value: string | undefined): string {",
    "    assertDefined(value);",
    "",
    "    return value;",
    "}",
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type AssertDefinedFixFactoryArgs = Readonly<{
    replacementTextFactory: (replacementName: string) => string;
}>;

type GuardComparisonOrientation =
    | "guardExpressionOnLeft"
    | "guardExpressionOnRight";

type GuardExpressionTemplateId =
    | "callExpression"
    | "identifier"
    | "memberExpression"
    | "parenthesizedIdentifier";

type NonCanonicalThrowTemplateId =
    | "errorConstructor"
    | "extraArgument"
    | "wrongMessage";

const guardComparisonOrientationArbitrary = fc.constantFrom(
    "guardExpressionOnLeft",
    "guardExpressionOnRight"
);

const guardExpressionTemplateIdArbitrary = fc.constantFrom(
    "identifier",
    "memberExpression",
    "callExpression",
    "parenthesizedIdentifier"
);

const nonCanonicalThrowTemplateIdArbitrary = fc.constantFrom(
    "wrongMessage",
    "errorConstructor",
    "extraArgument"
);

const buildGuardExpressionTemplate = (
    templateId: GuardExpressionTemplateId
): Readonly<{
    declarations: readonly string[];
    expressionText: string;
}> => {
    if (templateId === "identifier") {
        return {
            declarations: ["declare const maybeValue: string | undefined;"],
            expressionText: "maybeValue",
        };
    }

    if (templateId === "memberExpression") {
        return {
            declarations: [
                "declare const holder: { readonly current: string | undefined };",
            ],
            expressionText: "holder.current",
        };
    }

    if (templateId === "callExpression") {
        return {
            declarations: [
                "declare function readMaybeValue(): string | undefined;",
            ],
            expressionText: "readMaybeValue()",
        };
    }

    return {
        declarations: ["declare const maybeValue: string | undefined;"],
        expressionText: "(maybeValue)",
    };
};

const buildUndefinedComparisonText = ({
    expressionText,
    operator,
    orientation,
}: Readonly<{
    expressionText: string;
    operator: "==" | "===";
    orientation: GuardComparisonOrientation;
}>): string =>
    orientation === "guardExpressionOnLeft"
        ? `${expressionText} ${operator} undefined`
        : `undefined ${operator} ${expressionText}`;

const buildNonCanonicalThrowText = (
    templateId: NonCanonicalThrowTemplateId
): string => {
    if (templateId === "errorConstructor") {
        return "throw new Error('Expected a defined value, got `undefined`');";
    }

    if (templateId === "extraArgument") {
        return "throw new TypeError('Expected a defined value, got `undefined`', maybeValue);";
    }

    return "throw new TypeError('Missing value');";
};

const selectFirstFunctionDeclaration = (
    astBody: readonly Readonly<TSESTree.ProgramStatement>[]
): TSESTree.FunctionDeclarationWithName => {
    for (const statement of astBody) {
        if (statement.type === AST_NODE_TYPES.FunctionDeclaration) {
            return statement;
        }
    }

    throw new Error("Expected generated code to include a function");
};

const selectFirstIfStatement = (
    functionDeclaration: Readonly<TSESTree.FunctionDeclarationWithName>
): TSESTree.IfStatement => {
    for (const statement of functionDeclaration.body.body) {
        if (statement.type === AST_NODE_TYPES.IfStatement) {
            return statement;
        }
    }

    throw new Error("Expected generated code to include an IfStatement");
};

const selectGuardExpressionFromBinaryUndefinedComparison = (
    binaryExpression: Readonly<TSESTree.BinaryExpression>
): TSESTree.Expression => {
    const candidateGuardExpression =
        binaryExpression.left.type === AST_NODE_TYPES.Identifier &&
        binaryExpression.left.name === "undefined"
            ? binaryExpression.right
            : binaryExpression.left;

    if (candidateGuardExpression.type === AST_NODE_TYPES.PrivateIdentifier) {
        throw new Error(
            "Expected generated comparison guard expression to be an expression"
        );
    }

    return candidateGuardExpression;
};

const parseIfStatementFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    guardExpressionText: string;
    ifStatement: TSESTree.IfStatement;
    ifStatementRange: readonly [number, number];
}> => {
    const parsedResult = parser.parseForESLint(sourceText, parserOptions);
    const functionDeclaration = selectFirstFunctionDeclaration(
        parsedResult.ast.body
    );
    const ifStatement = selectFirstIfStatement(functionDeclaration);
    const ifTestExpression = ifStatement.test;

    if (ifTestExpression.type !== AST_NODE_TYPES.BinaryExpression) {
        throw new Error(
            "Expected generated if statement to use a binary undefined comparison"
        );
    }

    const guardExpression =
        selectGuardExpressionFromBinaryUndefinedComparison(ifTestExpression);

    return {
        ast: parsedResult.ast,
        guardExpressionText: sourceText.slice(
            guardExpression.range[0],
            guardExpression.range[1]
        ),
        ifStatement,
        ifStatementRange: ifStatement.range,
    };
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

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-ts-extras-assert-defined",
    {
        defaultOptions: [],
        docsDescription:
            "require ts-extras assertDefined over manual undefined-guard throw blocks.",
        enforceRuleShape: true,
        messages: {
            preferTsExtrasAssertDefined:
                "Prefer `assertDefined` from `ts-extras` over manual undefined guard throw blocks.",
            suggestTsExtrasAssertDefined:
                "Replace this manual guard with `assertDefined(...)` from `ts-extras`.",
        },
        name: "prefer-ts-extras-assert-defined",
    }
);

describe("prefer-ts-extras-assert-defined metadata assertions", () => {
    it("retains hasSuggestions metadata for assert-defined", () => {
        expect(rule.meta?.hasSuggestions).toBeTruthy();
    });
});

describe("prefer-ts-extras-assert-defined source assertions", () => {
    it("keeps assert-defined source guard and message canonical checks", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-ts-extras-assert-defined.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain(
            'node.type === "Identifier" && node.name === "undefined"'
        );
        expect(ruleSource).toContain("node.body.length === 1 &&");
        expect(ruleSource).toContain('node.body[0]?.type === "ThrowStatement"');
        expect(ruleSource).toContain(
            "throwStatement.argument.arguments.length !== 1"
        );
        expect(ruleSource).toContain(
            'if (!firstArgument || firstArgument.type === "SpreadElement") {'
        );
        expect(ruleSource).toContain(
            "context.sourceCode.getText(guardExpression)"
        );
        expect(ruleSource).toContain(
            '(test.operator !== "==" && test.operator !== "===")'
        );
        expect(ruleSource).toContain("isGlobalIdentifierNamed(");
        expect(ruleSource).toContain("isGlobalUndefinedIdentifier(");
    });

    it("preserves authored metadata literals for assert-defined rule", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-ts-extras-assert-defined.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain('name: "prefer-ts-extras-assert-defined"');
        expect(ruleSource).toContain("defaultOptions: []");
        expect(ruleSource).toContain("hasSuggestions: true,");
        expect(ruleSource).toContain(
            "require ts-extras assertDefined over manual undefined-guard throw blocks."
        );
        expect(ruleSource).toContain(
            "Prefer `assertDefined` from `ts-extras` over manual undefined guard throw blocks."
        );
        expect(ruleSource).toContain(
            "Replace this manual guard with `assertDefined(...)` from `ts-extras`."
        );
    });

    it("handles defensive consequent re-evaluation branch when synthetic AST nodes drift across reads", async () => {
        try {
            vi.resetModules();

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set(["assertDefined"]),
                createSafeValueNodeTextReplacementFix: () => () => [],
            }));

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalIdentifierNamed: (): boolean => true,
                isGlobalUndefinedIdentifier: (): boolean => true,
                isTestFilePath: (): boolean => false,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-ts-extras-assert-defined")) as {
                    default: {
                        create: (context: unknown) => {
                            IfStatement?: (node: unknown) => void;
                        };
                    };
                };

            const sourceText = [
                "function ensureValue(value: string | undefined): string {",
                "    if (value === undefined) {",
                "        throw new TypeError('Expected a defined value, got `undefined`');",
                "    }",
                "",
                "    return value;",
                "}",
            ].join("\n");

            const parsed = parser.parseForESLint(sourceText, {
                ecmaVersion: "latest",
                loc: true,
                range: true,
                sourceType: "module",
            });

            const [declaration] = parsed.ast.body;
            if (
                declaration?.type !== AST_NODE_TYPES.FunctionDeclaration ||
                declaration.body.body[0]?.type !== AST_NODE_TYPES.IfStatement
            ) {
                throw new Error(
                    "Expected function declaration containing IfStatement"
                );
            }

            const ifStatementNode = declaration.body.body[0];
            const originalConsequent = ifStatementNode.consequent;
            let consequentReadCount = 0;

            Object.defineProperty(ifStatementNode, "consequent", {
                configurable: true,
                get() {
                    consequentReadCount += 1;

                    if (consequentReadCount === 1) {
                        return originalConsequent;
                    }

                    if (
                        originalConsequent.type !==
                        AST_NODE_TYPES.BlockStatement
                    ) {
                        return originalConsequent;
                    }

                    return {
                        ...originalConsequent,
                        body: [undefined],
                    };
                },
            });

            const report = vi.fn();
            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-ts-extras-assert-defined.invalid.ts",
                report,
                sourceCode: {
                    ast: parsed.ast,
                    getText: () => "value",
                },
            });

            listenerMap.IfStatement?.(ifStatementNode);

            expect(report).toHaveBeenCalledTimes(1);
            expect(
                (report.mock.calls[0]?.[0] as { suggest?: unknown }).suggest
            ).toBeDefined();
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-assert-defined fast-check fix safety", () => {
    it("fast-check: canonical undefined guards report autofixes with parseable assertDefined replacement", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueNodeTextReplacementFixMock = vi.fn(
                (options: AssertDefinedFixFactoryArgs): string => {
                    if (typeof options.replacementTextFactory !== "function") {
                        throw new TypeError(
                            "Expected replacementTextFactory to be callable"
                        );
                    }

                    return "FIX";
                }
            );

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Map<string, ReadonlySet<string>>(),
                createSafeValueNodeTextReplacementFix:
                    createSafeValueNodeTextReplacementFixMock,
            }));

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalIdentifierNamed: (): boolean => true,
                isGlobalUndefinedIdentifier: (): boolean => true,
                isTestFilePath: (): boolean => false,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-assert-defined")) as {
                    default: {
                        create: (context: unknown) => {
                            IfStatement?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    guardExpressionTemplateIdArbitrary,
                    guardComparisonOrientationArbitrary,
                    fc.constantFrom("==", "==="),
                    fc.boolean(),
                    (
                        guardTemplateId,
                        comparisonOrientation,
                        comparisonOperator,
                        includeUnicodeNoiseLine
                    ) => {
                        createSafeValueNodeTextReplacementFixMock.mockClear();

                        const guardTemplate =
                            buildGuardExpressionTemplate(guardTemplateId);
                        const comparisonText = buildUndefinedComparisonText({
                            expressionText: guardTemplate.expressionText,
                            operator: comparisonOperator,
                            orientation: comparisonOrientation,
                        });
                        const code = [
                            'import { assertDefined } from "ts-extras";',
                            ...guardTemplate.declarations,
                            includeUnicodeNoiseLine
                                ? 'const glyphBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                                : "",
                            "",
                            "function ensureValue(): void {",
                            `    if (${comparisonText}) {`,
                            "        throw new TypeError('Expected a defined value, got `undefined`');",
                            "    }",
                            "}",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const {
                            ast,
                            guardExpressionText,
                            ifStatement,
                            ifStatementRange,
                        } = parseIfStatementFromCode(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                            suggest?: readonly unknown[];
                        }>[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: Readonly<{
                                    fix?: unknown;
                                    messageId?: string;
                                    suggest?: readonly unknown[];
                                }>
                            ) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.IfStatement?.(ifStatement);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            fix: "FIX",
                            messageId: "preferTsExtrasAssertDefined",
                        });
                        expect(reportCalls[0]?.suggest).toBeUndefined();
                        expect(
                            createSafeValueNodeTextReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const fixArguments =
                            createSafeValueNodeTextReplacementFixMock.mock
                                .calls[0]?.[0];

                        expect(fixArguments).toBeDefined();

                        const replacementText =
                            fixArguments?.replacementTextFactory(
                                "assertDefined"
                            ) ?? "";

                        expect(replacementText).toBe(
                            `assertDefined(${guardExpressionText});`
                        );

                        const fixedCode =
                            code.slice(0, ifStatementRange[0]) +
                            replacementText +
                            code.slice(ifStatementRange[1]);

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

    it("fast-check: non-canonical throw shapes report suggestions with parseable assertDefined replacement", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueNodeTextReplacementFixMock = vi.fn(
                (options: AssertDefinedFixFactoryArgs): string => {
                    if (typeof options.replacementTextFactory !== "function") {
                        throw new TypeError(
                            "Expected replacementTextFactory to be callable"
                        );
                    }

                    return "FIX";
                }
            );

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Map<string, ReadonlySet<string>>(),
                createSafeValueNodeTextReplacementFix:
                    createSafeValueNodeTextReplacementFixMock,
            }));

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalIdentifierNamed: (): boolean => true,
                isGlobalUndefinedIdentifier: (): boolean => true,
                isTestFilePath: (): boolean => false,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-assert-defined")) as {
                    default: {
                        create: (context: unknown) => {
                            IfStatement?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    guardExpressionTemplateIdArbitrary,
                    guardComparisonOrientationArbitrary,
                    fc.constantFrom("==", "==="),
                    nonCanonicalThrowTemplateIdArbitrary,
                    (
                        guardTemplateId,
                        comparisonOrientation,
                        comparisonOperator,
                        throwTemplateId
                    ) => {
                        createSafeValueNodeTextReplacementFixMock.mockClear();

                        const guardTemplate =
                            buildGuardExpressionTemplate(guardTemplateId);
                        const comparisonText = buildUndefinedComparisonText({
                            expressionText: guardTemplate.expressionText,
                            operator: comparisonOperator,
                            orientation: comparisonOrientation,
                        });
                        const code = [
                            'import { assertDefined } from "ts-extras";',
                            ...guardTemplate.declarations,
                            "",
                            "function ensureValue(): void {",
                            `    if (${comparisonText}) {`,
                            `        ${buildNonCanonicalThrowText(throwTemplateId)}`,
                            "    }",
                            "}",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const {
                            ast,
                            guardExpressionText,
                            ifStatement,
                            ifStatementRange,
                        } = parseIfStatementFromCode(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                            suggest?: readonly Readonly<{
                                fix?: unknown;
                                messageId?: string;
                            }>[];
                        }>[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: Readonly<{
                                    fix?: unknown;
                                    messageId?: string;
                                    suggest?: readonly Readonly<{
                                        fix?: unknown;
                                        messageId?: string;
                                    }>[];
                                }>
                            ) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.IfStatement?.(ifStatement);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferTsExtrasAssertDefined",
                        });
                        expect(reportCalls[0]?.fix).toBeUndefined();
                        expect(reportCalls[0]?.suggest).toHaveLength(1);
                        expect(reportCalls[0]?.suggest?.[0]).toMatchObject({
                            fix: "FIX",
                            messageId: "suggestTsExtrasAssertDefined",
                        });
                        expect(
                            createSafeValueNodeTextReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const fixArguments =
                            createSafeValueNodeTextReplacementFixMock.mock
                                .calls[0]?.[0];
                        const replacementText =
                            fixArguments?.replacementTextFactory(
                                "assertDefined"
                            ) ?? "";

                        expect(replacementText).toBe(
                            `assertDefined(${guardExpressionText});`
                        );

                        const suggestedCode =
                            code.slice(0, ifStatementRange[0]) +
                            replacementText +
                            code.slice(ifStatementRange[1]);

                        expect(() => {
                            parser.parseForESLint(suggestedCode, parserOptions);
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

ruleTester.run("prefer-ts-extras-assert-defined", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                },
                {
                    messageId: "preferTsExtrasAssertDefined",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture guards against undefined",
        },
        {
            code: undefinedOnLeftInvalidCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict undefined guard with literal on left",
        },
        {
            code: looseEqualityInvalidCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports loose equality undefined guard",
        },
        {
            code: inlineInvalidDirectThrowConsequentCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct-throw consequent guard",
        },
        {
            code: inlineSuggestableWrongConstructorCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement when canonical message uses non-TypeError constructor",
        },
        {
            code: inlineSuggestableTooManyArgsCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement when TypeError call has multiple arguments",
        },
        {
            code: inlineSuggestableSpreadArgumentCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineSuggestableSpreadArgumentOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement when TypeError call spreads message arguments",
        },
        {
            code: inlineSuggestableCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests assertDefined() replacement when import is in scope",
        },
        {
            code: shadowedTypeErrorSuggestableCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: shadowedTypeErrorSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement when TypeError constructor is shadowed",
        },
        {
            code: inlineAutofixableCanonicalCode,
            errors: [{ messageId: "preferTsExtrasAssertDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes canonical undefined guard throw when assertDefined import is in scope",
            output: inlineAutofixableCanonicalOutput,
        },
        {
            code: inlineAutofixableDirectThrowCanonicalCode,
            errors: [{ messageId: "preferTsExtrasAssertDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes direct-throw canonical undefined guard",
            output: inlineAutofixableCanonicalOutput,
        },
        {
            code: inlineAutofixableCanonicalUnicodeRichCode,
            errors: [{ messageId: "preferTsExtrasAssertDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes canonical undefined guard in unicode-rich source text",
            output: inlineAutofixableCanonicalUnicodeRichOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: nonUndefinedValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores null-only comparison",
        },
        {
            code: nonThrowOnlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guard with extra side-effect statement",
        },
        {
            code: nonThrowSingleStatementBlockValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores single-statement block consequents that are not throws",
        },
        {
            code: throwThenSideEffectValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores multi-statement blocks even when the first statement throws",
        },
        {
            code: alternateValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guard that includes else branch",
        },
        {
            code: nonBinaryGuardValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-binary guard expression",
        },
        {
            code: emptyConsequentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined guard with an empty consequent",
        },
        {
            code: shadowedUndefinedBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guards that compare against shadowed undefined bindings",
        },
    ],
});
