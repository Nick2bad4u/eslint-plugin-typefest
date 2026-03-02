import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-defined.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import {
    fastCheckRunConfig,
    isSafeGeneratedIdentifier,
} from "./_internal/fast-check";
import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-is-defined";
const docsDescription =
    "require ts-extras isDefined over inline undefined comparisons outside filter callbacks.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-defined";
const preferTsExtrasIsDefinedMessage =
    "Prefer `isDefined(value)` from `ts-extras` over inline undefined comparisons.";
const preferTsExtrasIsDefinedNegatedMessage =
    "Prefer `!isDefined(value)` from `ts-extras` over inline undefined comparisons.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-defined.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-defined.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const replaceOrThrow = ({
    replacement,
    sourceText,
    target,
}: Readonly<{
    replacement: string;
    sourceText: string;
    target: string;
}>): string => {
    const replacedText = sourceText.replace(target, replacement);

    if (replacedText === sourceText) {
        throw new TypeError(
            `Expected prefer-ts-extras-is-defined fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureInvalidOutput = `import { isDefined } from "ts-extras";\n${replaceOrThrow(
    {
        replacement: "if (isDefined(maybeValue)) {\r\n",
        sourceText: invalidFixtureCode,
        target: "if (maybeValue !== undefined) {\r\n",
    }
)}`;
const fixtureInvalidSecondPassOutput = replaceOrThrow({
    replacement: "if (!isDefined(maybeValue)) {\r\n",
    sourceText: replaceOrThrow({
        replacement: "if (!isDefined(maybeValue)) {\r\n",
        sourceText: replaceOrThrow({
            replacement: "if (isDefined(maybeValue)) {\r\n",
            sourceText: replaceOrThrow({
                replacement: "if (isDefined(maybeValue)) {\r\n",
                sourceText: fixtureInvalidOutput,
                target: "if (undefined !== maybeValue) {\r\n",
            }),
            target: 'if (typeof maybeValue !== "undefined") {\r\n',
        }),
        target: "if (maybeValue === undefined) {\r\n",
    }),
    target: 'if ("undefined" === typeof maybeValue) {\r\n',
});
const inlineFixableDefinedCode = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const hasValue = maybeValue !== undefined;",
].join("\n");
const inlineFixableDefinedOutput = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const hasValue = isDefined(maybeValue);",
].join("\n");
const inlineFixableNegatedCode = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const isMissing = maybeValue === undefined;",
].join("\n");
const inlineFixableNegatedOutput = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const isMissing = !isDefined(maybeValue);",
].join("\n");
const inlineMapCallbackInvalidCode = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const values: Array<string | undefined>;",
    "const mapped = values.map((value) => value !== undefined);",
    "String(mapped.length);",
].join("\n");
const inlineMapCallbackInvalidOutput = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const values: Array<string | undefined>;",
    "const mapped = values.map((value) => isDefined(value));",
    "String(mapped.length);",
].join("\n");
const inlineTypeofReverseInvalidCode = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    'const hasValue = "undefined" !== typeof maybeValue;',
].join("\n");
const inlineTypeofNonIdentifierInvalidCode = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    'const hasValue = typeof (maybeValue ?? "fallback") !== "undefined";',
].join("\n");
const inlineTypeofNonIdentifierInvalidOutput = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    'const hasValue = isDefined(maybeValue ?? "fallback");',
].join("\n");
const inlineTypeofReverseInvalidOutput = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const hasValue = isDefined(maybeValue);",
].join("\n");
const filterArrowCallbackValidCode = [
    "declare const values: Array<string | undefined>;",
    "const onlyDefined = values.filter((value) => value !== undefined);",
    "String(onlyDefined.length);",
].join("\n");
const filterFunctionCallbackValidCode = [
    "declare const values: Array<string | undefined>;",
    "const onlyDefined = values.filter(function (value) {",
    "    return value !== undefined;",
    "});",
    "String(onlyDefined.length);",
].join("\n");
const typeofWithNonTypeofOperatorValidCode = [
    "declare const maybeValue: string | undefined;",
    'const hasValue = void maybeValue !== "undefined";',
    "String(hasValue);",
].join("\n");
const reversedTypeofWithNonTypeofOperatorValidCode = [
    "declare const maybeValue: string | undefined;",
    'const hasValue = "undefined" !== void maybeValue;',
    "String(hasValue);",
].join("\n");
const shadowedUndefinedBindingValidCode = [
    "declare const maybeValue: string | undefined;",
    "const undefined = Symbol('undefined');",
    "const hasValue = maybeValue !== undefined;",
    "String(hasValue);",
].join("\n");
const undeclaredTypeofInequalityValidCode = [
    'const hasValue = typeof maybeUndeclared !== "undefined";',
    "String(hasValue);",
].join("\n");
const undeclaredTypeofEqualityValidCode = [
    'const isMissing = "undefined" === typeof maybeUndeclared;',
    "String(isMissing);",
].join("\n");

type IsDefinedReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
}>;

type UndefinedComparisonPattern =
    | "directUndefinedLeft"
    | "directUndefinedRight"
    | "typeofUndefinedLeft"
    | "typeofUndefinedRight";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const undefinedComparisonPatternArbitrary =
    fc.constantFrom<UndefinedComparisonPattern>(
        "directUndefinedLeft",
        "directUndefinedRight",
        "typeofUndefinedLeft",
        "typeofUndefinedRight"
    );

const undefinedComparisonOperatorArbitrary = fc.constantFrom(
    "!=",
    "!==",
    "==",
    "==="
);

const identifierNameArbitrary = fc
    .string({ maxLength: 9, minLength: 1 })
    .filter((candidate) => isSafeGeneratedIdentifier(candidate))
    .filter(
        (candidate) => candidate !== "undefined" && candidate !== "isDefined"
    );

const buildUndefinedComparisonExpression = ({
    identifierName,
    operator,
    pattern,
}: Readonly<{
    identifierName: string;
    operator: "!=" | "!==" | "==" | "===";
    pattern: UndefinedComparisonPattern;
}>): string => {
    if (pattern === "directUndefinedLeft") {
        return `undefined ${operator} ${identifierName}`;
    }

    if (pattern === "directUndefinedRight") {
        return `${identifierName} ${operator} undefined`;
    }

    if (pattern === "typeofUndefinedLeft") {
        return `"undefined" ${operator} typeof ${identifierName}`;
    }

    return `typeof ${identifierName} ${operator} "undefined"`;
};

const parseUndefinedComparisonFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    binaryExpression: TSESTree.BinaryExpression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (
                    declaration.init?.type === AST_NODE_TYPES.BinaryExpression
                ) {
                    return {
                        ast: parsed.ast,
                        binaryExpression: declaration.init,
                    };
                }
            }
        }
    }

    throw new Error(
        "Expected generated source text to contain a binary expression variable initializer"
    );
};

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasIsDefined: preferTsExtrasIsDefinedMessage,
        preferTsExtrasIsDefinedNegated: preferTsExtrasIsDefinedNegatedMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-is-defined metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-is-defined internal create guards", () => {
    it("uses empty filename fallback when context filename is undefined", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
                isTestFilePath: (filePath: string) => filePath.length > 0,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueArgumentFunctionCallFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-defined")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: undefined,
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    getText: () => "maybeValue",
                },
            });

            const binaryExpressionListener = listeners.BinaryExpression;

            expect(binaryExpressionListener).toBeTypeOf("function");

            binaryExpressionListener?.({
                left: {
                    name: "maybeValue",
                    type: "Identifier",
                },
                operator: "!==",
                right: {
                    name: "undefined",
                    type: "Identifier",
                },
                type: "BinaryExpression",
            });

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]?.messageId).toBe("preferTsExtrasIsDefined");
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("gracefully skips typeof comparisons when scope lookup throws", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
                isTestFilePath: (): boolean => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueArgumentFunctionCallFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-defined")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-ts-extras-is-defined.invalid.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    getScope: (): never => {
                        throw new Error("scope unavailable");
                    },
                    getText: () => "maybeValue",
                },
            });

            listeners.BinaryExpression?.({
                left: {
                    argument: {
                        name: "maybeValue",
                        type: "Identifier",
                    },
                    operator: "typeof",
                    type: "UnaryExpression",
                },
                operator: "!==",
                right: {
                    type: "Literal",
                    value: "undefined",
                },
                type: "BinaryExpression",
            });

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: undefined comparisons report and produce parseable isDefined rewrites", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueArgumentFunctionCallFixMock = vi.fn(
                (...args: readonly unknown[]) =>
                    args.length >= 0 ? "FIX" : "UNREACHABLE"
            );

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ): boolean =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
                isTestFilePath: (): boolean => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueArgumentFunctionCallFix:
                    createSafeValueArgumentFunctionCallFixMock,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-defined")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    identifierNameArbitrary,
                    undefinedComparisonPatternArbitrary,
                    undefinedComparisonOperatorArbitrary,
                    fc.boolean(),
                    (
                        identifierName,
                        comparisonPattern,
                        comparisonOperator,
                        includeUnicodeLine
                    ) => {
                        createSafeValueArgumentFunctionCallFixMock.mockClear();

                        const comparisonExpression =
                            buildUndefinedComparisonExpression({
                                identifierName,
                                operator: comparisonOperator,
                                pattern: comparisonPattern,
                            });
                        const unicodeLine = includeUnicodeLine
                            ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                            : "";
                        const generatedCode = [
                            `declare let ${identifierName}: string | undefined;`,
                            unicodeLine,
                            `const comparisonResult = ${comparisonExpression};`,
                            "String(comparisonResult);",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const { ast, binaryExpression } =
                            parseUndefinedComparisonFromCode(generatedCode);
                        const reports: IsDefinedReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename:
                                "fixtures/typed/prefer-ts-extras-is-defined.invalid.ts",
                            report: (descriptor: IsDefinedReportDescriptor) => {
                                reports.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getScope(node: unknown): unknown {
                                    const identifierNameFromNode =
                                        typeof node === "object" &&
                                        node !== null &&
                                        "name" in node
                                            ? (
                                                  node as Readonly<{
                                                      name?: unknown;
                                                  }>
                                              ).name
                                            : undefined;

                                    const normalizedIdentifierName =
                                        typeof identifierNameFromNode ===
                                        "string"
                                            ? identifierNameFromNode
                                            : "";

                                    return {
                                        set: new Map([
                                            [
                                                normalizedIdentifierName,
                                                {
                                                    defs: [{}],
                                                },
                                            ],
                                        ]),
                                        upper: null,
                                    };
                                },
                                getText(node: unknown): string {
                                    if (
                                        typeof node !== "object" ||
                                        node === null ||
                                        !("range" in node)
                                    ) {
                                        return "";
                                    }

                                    const nodeRange = (
                                        node as Readonly<{
                                            range?: readonly [number, number];
                                        }>
                                    ).range;

                                    if (nodeRange === undefined) {
                                        return "";
                                    }

                                    return generatedCode.slice(
                                        nodeRange[0],
                                        nodeRange[1]
                                    );
                                },
                            },
                        });

                        listeners.BinaryExpression?.(binaryExpression);

                        const isNegatedExpected =
                            comparisonOperator === "==" ||
                            comparisonOperator === "===";
                        const expectedMessageId = isNegatedExpected
                            ? "preferTsExtrasIsDefinedNegated"
                            : "preferTsExtrasIsDefined";

                        expect(reports).toHaveLength(1);
                        expect(reports[0]).toMatchObject({
                            fix: "FIX",
                            messageId: expectedMessageId,
                        });

                        expect(
                            createSafeValueArgumentFunctionCallFixMock
                        ).toHaveBeenCalledTimes(1);

                        const fixDescriptor =
                            createSafeValueArgumentFunctionCallFixMock.mock
                                .calls[0]?.[0] as
                                | undefined
                                | {
                                      negated?: boolean;
                                  };

                        expect(fixDescriptor?.negated).toBe(isNegatedExpected);

                        const replacementText = isNegatedExpected
                            ? `!isDefined(${identifierName})`
                            : `isDefined(${identifierName})`;
                        const fixedCode = `${generatedCode.slice(0, binaryExpression.range[0])}${replacementText}${generatedCode.slice(binaryExpression.range[1])}`;

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
            code: invalidFixtureCode,
            errors: [
                { messageId: "preferTsExtrasIsDefined" },
                { messageId: "preferTsExtrasIsDefined" },
                { messageId: "preferTsExtrasIsDefined" },
                { messageId: "preferTsExtrasIsDefinedNegated" },
                { messageId: "preferTsExtrasIsDefinedNegated" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture strict defined and undefined comparisons",
            output: [fixtureInvalidOutput, fixtureInvalidSecondPassOutput],
        },
        {
            code: inlineFixableDefinedCode,
            errors: [{ messageId: "preferTsExtrasIsDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes undefined inequality when isDefined import is in scope",
            output: inlineFixableDefinedOutput,
        },
        {
            code: inlineFixableNegatedCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedNegated" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes undefined equality when isDefined import is in scope",
            output: inlineFixableNegatedOutput,
        },
        {
            code: inlineMapCallbackInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports undefined comparison in non-filter callback",
            output: inlineMapCallbackInvalidOutput,
        },
        {
            code: inlineTypeofReverseInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes reversed typeof undefined inequality",
            output: inlineTypeofReverseInvalidOutput,
        },
        {
            code: inlineTypeofNonIdentifierInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes typeof checks over non-identifier expressions",
            output: inlineTypeofNonIdentifierInvalidOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: filterArrowCallbackValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined comparison inside filter arrow callback",
        },
        {
            code: filterFunctionCallbackValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined comparison inside filter function callback",
        },
        {
            code: typeofWithNonTypeofOperatorValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores void unary comparison against undefined string literal",
        },
        {
            code: reversedTypeofWithNonTypeofOperatorValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores reversed void unary comparison against undefined string literal",
        },
        {
            code: shadowedUndefinedBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores comparisons against shadowed undefined bindings",
        },
        {
            code: undeclaredTypeofInequalityValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores typeof inequality checks against undeclared identifiers",
        },
        {
            code: undeclaredTypeofEqualityValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores reversed typeof equality checks against undeclared identifiers",
        },
    ],
});
