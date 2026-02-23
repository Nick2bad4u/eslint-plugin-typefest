import { describe, expect, it, vi } from "vitest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-present-filter.test` behavior.
 */
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
    "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-present-filter.md";
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
        const reportCalls: { messageId?: string; }[] = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () => new Set<string>(),
                createSafeValueReferenceReplacementFix: () => null,
            }));

            const authoredRuleModule = (await import(
                "../src/rules/prefer-ts-extras-is-present-filter"
            )) as {
                default: {
                    create: (context: unknown) => {
                        CallExpression?: (node: unknown) => void;
                    };
                };
            };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report (descriptor: Readonly<{ messageId?: string; }>) {
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
const fixtureInvalidSecondPassOutputWithMixedLineEndings =
    fixtureInvalidOutputWithMixedLineEndings.replace(
        "const numbers = maybeNumbers.filter((value) => value != undefined);\r\n",
        "const numbers = maybeNumbers.filter(isPresent);\r\n"
    );

ruleTester.run(
    ruleId,
    rule,
    {
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
                code: invalidFixtureCode,
                filename: typedFixturePath("tests", invalidFixtureName),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
