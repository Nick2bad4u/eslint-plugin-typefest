/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-present-filter.test` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

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

const ruleId = "prefer-ts-extras-is-present-filter";
const docsDescription =
    "require ts-extras isPresent in Array.filter callbacks instead of inline nullish checks.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-present-filter";
const preferTsExtrasIsPresentFilterMessage =
    "Prefer `isPresent` from `ts-extras` in `filter(...)` callbacks over inline nullish comparisons.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const invalidFixtureName = "prefer-ts-extras-is-present-filter.invalid.ts";
const validFixtureName = "prefer-ts-extras-is-present-filter.valid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const inlineInvalidPredicateUndefinedStrictCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineInvalidTypeofUndefinedGuardCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    '    (value): value is string => value !== null && typeof value !== "undefined"',
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineInvalidTypeofUndefinedGuardOutput = [
    'import { isPresent } from "ts-extras";',
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    isPresent",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineInvalidReverseNullLooseCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter((value) => null != value);",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineInvalidReverseNullLooseOutput = [
    'import { isPresent } from "ts-extras";',
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(isPresent);",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineInvalidReverseUndefinedLooseCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter((value) => undefined != value);",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineInvalidReverseUndefinedLooseOutput = [
    'import { isPresent } from "ts-extras";',
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(isPresent);",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidStrictNullWithoutPredicateCode = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter((value) => value !== null);",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidStrictUndefinedWithoutPredicateCode = [
    "declare const values: readonly (string | undefined)[];",
    "",
    "const presentValues = values.filter((value) => value !== undefined);",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidAndWithoutUndefinedCheckCode = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter((value) => value !== null && value !== '');",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidLogicalOrNullishGuardCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value !== null || value !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidAndThreeTermNullishGuardCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "declare const includeValue: boolean;",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string =>",
    "        value !== null && value !== undefined && includeValue",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidAndNonParameterNullComparisonCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "declare const otherValue: null | string;",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => otherValue !== null && value !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidAndNonParameterUndefinedComparisonCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "declare const maybeValue: string | undefined;",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value !== null && maybeValue !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidAndNonNullLiteralComparisonCode = [
    "declare const values: readonly (number | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    (value): value is number => value !== 0 && value !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidAndUndefinedAliasComparisonCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "declare const undefinedAlias: undefined;",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value !== null && value !== undefinedAlias",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidReverseNonUndefinedIdentifierComparisonCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "declare const marker: string;",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => marker != value",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidFilterBlockBodyCode = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter((value) => {",
    "    return value != null;",
    "});",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidFunctionExpressionCode = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter(function (value) {",
    "    return value != null;",
    "});",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidComputedFilterCode = [
    "declare const values: readonly (null | string)[];",
    "",
    'const presentValues = values["filter"]((value) => value != null);',
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidNoCallbackCode = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter();",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidDestructuredParameterCode = [
    "declare const values: readonly ({ readonly value: null | string })[];",
    "",
    "const presentValues = values.filter(({ value }) => value != null);",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidSecondCallbackParameterCode = [
    "declare const values: readonly (null | string)[];",
    "",
    "const presentValues = values.filter((value, _index) => value != null);",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidMapCallbackCode = [
    "declare const values: readonly (null | string)[];",
    "",
    "const mapped = values.map((value) => value != null);",
    "",
    "String(mapped.length);",
].join("\n");
const inlineFixableCode = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter((value) => value != null);",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineFixableOutput = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(isPresent);",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineInvalidMixedNullishOperatorCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value != null && value !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineInvalidReversedTypeofUndefinedCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    '    (value): value is string => value !== null && "undefined" !== typeof value',
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineInvalidReversedTypeofUndefinedOutput = [
    'import { isPresent } from "ts-extras";',
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    isPresent",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidUnsupportedNullishOperatorCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value === null",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");
const inlineValidShadowedUndefinedBindingCode = [
    "declare const values: readonly (null | string | undefined)[];",
    "const undefined = Symbol('undefined');",
    "",
    "const presentValues = values.filter(",
    "    (value): value is string => value !== null && value !== undefined",
    ");",
    "",
    "String(presentValues.length);",
].join("\n");

type AutoFixableTemplateId =
    | "looseNull"
    | "looseNullReversed"
    | "looseTypeofUndefined"
    | "looseTypeofUndefinedReversed"
    | "looseUndefined"
    | "looseUndefinedReversed"
    | "strictNullAndUndefined"
    | "strictUndefinedAndNull";

type StrictPredicateTemplateId =
    | "strictNull"
    | "strictNullReversed"
    | "strictUndefined"
    | "strictUndefinedReversed";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const callbackParameterNameArbitrary = fc
    .string({ maxLength: 9, minLength: 1 })
    .filter((candidate) => isSafeGeneratedIdentifier(candidate));

const autoFixableTemplateIdArbitrary = fc.constantFrom<AutoFixableTemplateId>(
    "looseNull",
    "looseNullReversed",
    "looseUndefined",
    "looseUndefinedReversed",
    "looseTypeofUndefined",
    "looseTypeofUndefinedReversed",
    "strictNullAndUndefined",
    "strictUndefinedAndNull"
);

const strictPredicateTemplateIdArbitrary =
    fc.constantFrom<StrictPredicateTemplateId>(
        "strictNull",
        "strictNullReversed",
        "strictUndefined",
        "strictUndefinedReversed"
    );

const formatAutoFixableGuardExpression = (
    templateId: AutoFixableTemplateId,
    parameterName: string
): string => {
    if (templateId === "looseNull") {
        return `${parameterName} != null`;
    }

    if (templateId === "looseNullReversed") {
        return `null != ${parameterName}`;
    }

    if (templateId === "looseUndefined") {
        return `${parameterName} != undefined`;
    }

    if (templateId === "looseUndefinedReversed") {
        return `undefined != ${parameterName}`;
    }

    if (templateId === "looseTypeofUndefined") {
        return `typeof ${parameterName} != "undefined"`;
    }

    if (templateId === "looseTypeofUndefinedReversed") {
        return `"undefined" != typeof ${parameterName}`;
    }

    if (templateId === "strictNullAndUndefined") {
        return `${parameterName} !== null && ${parameterName} !== undefined`;
    }

    return `${parameterName} !== undefined && ${parameterName} !== null`;
};

const formatStrictPredicateExpression = (
    templateId: StrictPredicateTemplateId,
    parameterName: string
): string => {
    if (templateId === "strictNull") {
        return `${parameterName} !== null`;
    }

    if (templateId === "strictNullReversed") {
        return `null !== ${parameterName}`;
    }

    if (templateId === "strictUndefined") {
        return `${parameterName} !== undefined`;
    }

    return `undefined !== ${parameterName}`;
};

const parseFilterCallFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    callbackRange: readonly [number, number];
    callExpression: TSESTree.CallExpression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);
    let callExpression: null | TSESTree.CallExpression = null;

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (declaration.init?.type === AST_NODE_TYPES.CallExpression) {
                    callExpression = declaration.init;
                    break;
                }
            }
        }

        if (callExpression) {
            break;
        }
    }

    if (!callExpression) {
        throw new Error(
            "Expected generated declaration to initialize from filter call"
        );
    }

    const callback = callExpression.arguments[0];

    if (callback?.type !== AST_NODE_TYPES.ArrowFunctionExpression) {
        throw new Error(
            "Expected generated filter call to include an arrow-function callback"
        );
    }

    const callbackRange = callback.range;

    return {
        ast: parsed.ast,
        callbackRange,
        callExpression,
    };
};

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasIsPresentFilter: preferTsExtrasIsPresentFilterMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-is-present-filter metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-is-present-filter internal listener guards", () => {
    it("ignores non-Identifier filter property and non-callback first argument", async () => {
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
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueReferenceReplacementFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present-filter")) as {
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
                    getText: () => "value",
                },
            });

            const callExpressionListener = listeners.CallExpression;

            expect(callExpressionListener).toBeTypeOf("function");

            const privateFilterMemberCallNode = {
                arguments: [
                    {
                        body: {
                            left: {
                                name: "value",
                                type: "Identifier",
                            },
                            operator: "!=",
                            right: {
                                type: "Literal",
                                value: null,
                            },
                            type: "BinaryExpression",
                        },
                        params: [
                            {
                                name: "value",
                                type: "Identifier",
                            },
                        ],
                        type: "ArrowFunctionExpression",
                    },
                ],
                callee: {
                    computed: false,
                    object: {
                        name: "values",
                        type: "Identifier",
                    },
                    property: {
                        name: "filter",
                        type: "PrivateIdentifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };
            const logicalExpressionFilterArgumentCallNode = {
                arguments: [
                    {
                        left: {
                            name: "value",
                            type: "Identifier",
                        },
                        operator: "!=",
                        right: {
                            type: "Literal",
                            value: null,
                        },
                        type: "BinaryExpression",
                    },
                ],
                callee: {
                    computed: false,
                    object: {
                        name: "values",
                        type: "Identifier",
                    },
                    property: {
                        name: "filter",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            callExpressionListener?.(privateFilterMemberCallNode);
            callExpressionListener?.(logicalExpressionFilterArgumentCallNode);

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("ignores logical-or callback bodies that do not match strict present filter guards", async () => {
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
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueReferenceReplacementFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present-filter")) as {
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
                    getText: () => "value",
                },
            });

            listeners.CallExpression?.({
                arguments: [
                    {
                        body: {
                            left: {
                                left: {
                                    name: "value",
                                    type: "Identifier",
                                },
                                operator: "!==",
                                right: {
                                    type: "Literal",
                                    value: null,
                                },
                                type: "BinaryExpression",
                            },
                            operator: "||",
                            right: {
                                left: {
                                    name: "value",
                                    type: "Identifier",
                                },
                                operator: "!==",
                                right: {
                                    name: "undefined",
                                    type: "Identifier",
                                },
                                type: "BinaryExpression",
                            },
                            type: "LogicalExpression",
                        },
                        params: [
                            {
                                name: "value",
                                type: "Identifier",
                            },
                        ],
                        type: "ArrowFunctionExpression",
                    },
                ],
                callee: {
                    computed: false,
                    object: {
                        name: "values",
                        type: "Identifier",
                    },
                    property: {
                        name: "filter",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            });

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: autofixable filter guards report and allow parseable callback replacement", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueReferenceReplacementFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueReferenceReplacementFix:
                    createSafeValueReferenceReplacementFixMock,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present-filter")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    callbackParameterNameArbitrary,
                    autoFixableTemplateIdArbitrary,
                    (parameterName, templateId) => {
                        createSafeValueReferenceReplacementFixMock.mockClear();

                        const guardExpression =
                            formatAutoFixableGuardExpression(
                                templateId,
                                parameterName
                            );
                        const code = [
                            "declare const values: readonly (null | string | undefined)[];",
                            "",
                            `const presentValues = values.filter((${parameterName}) => ${guardExpression});`,
                            "",
                            "String(presentValues.length);",
                        ].join("\n");

                        const { ast, callbackRange, callExpression } =
                            parseFilterCallFromCode(code);
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

                                    if (!nodeRange) {
                                        return "";
                                    }

                                    const [start, end] = nodeRange;
                                    return code.slice(start, end);
                                },
                            },
                        });

                        listeners.CallExpression?.(callExpression);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            fix: "FIX",
                            messageId: "preferTsExtrasIsPresentFilter",
                        });
                        expect(
                            createSafeValueReferenceReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const [callbackStart, callbackEnd] = callbackRange;
                        const fixedCode = `${code.slice(
                            0,
                            callbackStart
                        )}isPresent${code.slice(callbackEnd)}`;

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

    it("fast-check: strict single-part predicate guards report without autofix", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueReferenceReplacementFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueReferenceReplacementFix:
                    createSafeValueReferenceReplacementFixMock,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present-filter")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    callbackParameterNameArbitrary,
                    strictPredicateTemplateIdArbitrary,
                    (parameterName, templateId) => {
                        createSafeValueReferenceReplacementFixMock.mockClear();

                        const guardExpression = formatStrictPredicateExpression(
                            templateId,
                            parameterName
                        );
                        const code = [
                            "declare const values: readonly (null | string | undefined)[];",
                            "",
                            "const presentValues = values.filter(",
                            `    (${parameterName}): ${parameterName} is string => ${guardExpression}`,
                            ");",
                            "",
                            "String(presentValues.length);",
                        ].join("\n");

                        const { ast, callExpression } =
                            parseFilterCallFromCode(code);
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
                                getText: () => parameterName,
                            },
                        });

                        listeners.CallExpression?.(callExpression);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            fix: null,
                            messageId: "preferTsExtrasIsPresentFilter",
                        });
                        expect(
                            createSafeValueReferenceReplacementFixMock
                        ).not.toHaveBeenCalled();
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

const fixtureInvalidOutput = [
    "interface MonitorRecord {",
    "    readonly id: string;",
    "}",
    "",
    "declare const nullableEntries: readonly (MonitorRecord | null)[];",
    "declare const nullableMonitors: readonly (MonitorRecord | null | undefined)[];",
    "declare const maybeNumbers: readonly (null | number | undefined)[];",
    "",
    "const entries = nullableEntries.filter(",
    "    (entry): entry is MonitorRecord => entry !== null",
    ");",
    "const monitors = nullableMonitors.filter(",
    "    isPresent",
    ");",
    "const numbers = maybeNumbers.filter((value) => value != undefined);",
    "",
    "if (entries.length + monitors.length + numbers.length < 0) {",
    '    throw new TypeError("Unreachable total count");',
    "}",
    "",
    'export const __typedFixtureModule = "typed-fixture-module";',
].join("\r\n");
const fixtureInvalidOutputWithMixedLineEndings = `import { isPresent } from "ts-extras";\n${fixtureInvalidOutput}\r\n`;
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
            `Expected prefer-ts-extras-is-present-filter fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureInvalidSecondPassOutputWithMixedLineEndings = replaceOrThrow({
    replacement: "const numbers = maybeNumbers.filter(isPresent);\r\n",
    sourceText: fixtureInvalidOutputWithMixedLineEndings,
    target: "const numbers = maybeNumbers.filter((value) => value != undefined);\r\n",
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                { messageId: "preferTsExtrasIsPresentFilter" },
                { messageId: "preferTsExtrasIsPresentFilter" },
                { messageId: "preferTsExtrasIsPresentFilter" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture present-filter guards",
            output: [
                fixtureInvalidOutputWithMixedLineEndings,
                fixtureInvalidSecondPassOutputWithMixedLineEndings,
            ],
        },
        {
            code: inlineInvalidPredicateUndefinedStrictCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports predicate using strict undefined inequality",
            output: null,
        },
        {
            code: inlineInvalidTypeofUndefinedGuardCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports predicate using typeof undefined check",
            output: inlineInvalidTypeofUndefinedGuardOutput,
        },
        {
            code: inlineInvalidReverseNullLooseCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reverse null loose inequality predicate",
            output: inlineInvalidReverseNullLooseOutput,
        },
        {
            code: inlineInvalidReverseUndefinedLooseCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reverse undefined loose inequality predicate",
            output: inlineInvalidReverseUndefinedLooseOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes filter callback to isPresent when import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineInvalidMixedNullishOperatorCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports mixed loose and strict nullish inequality predicate without autofix",
            output: null,
        },
        {
            code: inlineInvalidReversedTypeofUndefinedCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reversed typeof undefined nullish guards",
            output: inlineInvalidReversedTypeofUndefinedOutput,
        },
        {
            code: inlineValidAndThreeTermNullishGuardCode,
            errors: [{ messageId: "preferTsExtrasIsPresentFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports three-term conjunction nullish guard callback without autofix",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidStrictNullWithoutPredicateCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict null inequality without type predicate",
        },
        {
            code: inlineValidStrictUndefinedWithoutPredicateCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict undefined inequality without type predicate",
        },
        {
            code: inlineValidAndWithoutUndefinedCheckCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores logical and callback lacking undefined check",
        },
        {
            code: inlineValidLogicalOrNullishGuardCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores disjunction nullish guard callback",
        },
        {
            code: inlineValidUnsupportedNullishOperatorCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores unsupported nullish binary operators",
        },
        {
            code: inlineValidAndNonParameterNullComparisonCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores null comparison using non-parameter identifier",
        },
        {
            code: inlineValidAndNonParameterUndefinedComparisonCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined comparison using non-parameter identifier",
        },
        {
            code: inlineValidAndNonNullLiteralComparisonCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-null literal comparison in conjunction",
        },
        {
            code: inlineValidAndUndefinedAliasComparisonCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined alias identifier comparison in conjunction",
        },
        {
            code: inlineValidReverseNonUndefinedIdentifierComparisonCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores reversed non-undefined identifier comparisons",
        },
        {
            code: inlineValidFilterBlockBodyCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores block-body filter callback",
        },
        {
            code: inlineValidFunctionExpressionCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores function expression callback",
        },
        {
            code: inlineValidComputedFilterCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores computed filter property access",
        },
        {
            code: inlineValidNoCallbackCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores filter call without callback",
        },
        {
            code: inlineValidDestructuredParameterCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores destructured callback parameter",
        },
        {
            code: inlineValidSecondCallbackParameterCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores filter callback with second index parameter",
        },
        {
            code: inlineValidMapCallbackCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-filter map callback",
        },
        {
            code: inlineValidShadowedUndefinedBindingCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores nullish conjunctions using shadowed undefined bindings",
        },
    ],
});
