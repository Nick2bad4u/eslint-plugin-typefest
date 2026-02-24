import { describe, expect, it, vi } from "vitest";

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

const ruleId = "prefer-ts-extras-is-defined-filter";
const docsDescription =
    "require ts-extras isDefined in Array.filter callbacks instead of inline undefined checks.";
const docsUrl =
    "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-defined-filter.md";
const preferTsExtrasIsDefinedFilterMessage =
    "Prefer `isDefined` from `ts-extras` in `filter(...)` callbacks over inline undefined comparisons.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-defined-filter.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-defined-filter.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);

const inlineInvalidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => value !== undefined);",
    "String(definedValues);",
].join("\n");
const inlineInvalidOutput = [
    'import { isDefined } from "ts-extras";',
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(isDefined);",
    "String(definedValues);",
].join("\n");

const inlineInvalidRightSideCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => undefined !== value);",
    "String(definedValues);",
].join("\n");
const inlineInvalidLooseCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => value != undefined);",
    "String(definedValues);",
].join("\n");
const inlineInvalidLooseOutput = [
    'import { isDefined } from "ts-extras";',
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(isDefined);",
    "String(definedValues);",
].join("\n");
const inlineInvalidLooseRightSideCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => undefined != value);",
    "String(definedValues);",
].join("\n");
const inlineInvalidLooseRightSideOutput = [
    'import { isDefined } from "ts-extras";',
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(isDefined);",
    "String(definedValues);",
].join("\n");
const inlineInvalidRightSideOutput = [
    'import { isDefined } from "ts-extras";',
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(isDefined);",
    "String(definedValues);",
].join("\n");
const typeofInvalidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => typeof value !== 'undefined');",
    "String(definedValues);",
].join("\n");
const typeofInvalidOutput = [
    'import { isDefined } from "ts-extras";',
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(isDefined);",
    "String(definedValues);",
].join("\n");
const typeofRightInvalidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => 'undefined' !== typeof value);",
    "String(definedValues);",
].join("\n");
const strictEqualityUndefinedValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => value === undefined);",
    "String(definedValues);",
].join("\n");
const nonUndefinedLooseComparisonValidCode = [
    "const values: Array<number | null> = [1, null, 2];",
    "const definedValues = values.filter((value) => value != null);",
    "String(definedValues);",
].join("\n");
const differentIdentifierComparisonValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "declare const otherValue: number | undefined;",
    "const definedValues = values.filter((value) => otherValue !== undefined);",
    "String(values.length + definedValues.length);",
].join("\n");
const undefinedAliasComparisonValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "declare const undefinedAlias: undefined;",
    "const definedValues = values.filter((value) => value !== undefinedAlias);",
    "String(values.length + definedValues.length);",
].join("\n");
const typeofNonUndefinedLiteralValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => typeof value !== 'void');",
    "String(values.length + definedValues.length);",
].join("\n");
const identifierBodyValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => value);",
    "String(definedValues);",
].join("\n");

const nonFilterValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.map((value) => value);",
    "String(definedValues);",
].join("\n");
const noArgumentValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter();",
    "String(definedValues);",
].join("\n");
const functionExpressionValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(function (value) {",
    "    return value !== undefined;",
    "});",
    "String(definedValues);",
].join("\n");
const blockBodyArrowValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => {",
    "    return value !== undefined;",
    "});",
    "String(definedValues);",
].join("\n");
const twoParamsArrowValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value, index) => value !== undefined && index >= 0);",
    "String(definedValues);",
].join("\n");
const destructuredParamValidCode = [
    "const values: Array<{ value: number | undefined }> = [{ value: 1 }, { value: undefined }];",
    "const definedValues = values.filter(({ value }) => value !== undefined);",
    "String(definedValues);",
].join("\n");

const computedFilterValidCode = [
    "const values: Array<number | undefined> = [1, undefined, 2];",
    'const definedValues = values["filter"]((value) => value !== undefined);',
    "String(definedValues);",
].join("\n");

const skipPathInvalidCode = inlineInvalidCode;
const inlineFixableCode = [
    'import { isDefined } from "ts-extras";',
    "",
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter((value) => value !== undefined);",
    "String(definedValues);",
].join("\n");
const inlineFixableOutput = [
    'import { isDefined } from "ts-extras";',
    "",
    "const values: Array<number | undefined> = [1, undefined, 2];",
    "const definedValues = values.filter(isDefined);",
    "String(definedValues);",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasIsDefinedFilter: preferTsExtrasIsDefinedFilterMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-is-defined-filter metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-is-defined-filter internal listener guards", () => {
    it("ignores non-Identifier filter property and non-callback first argument", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueReferenceReplacementFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-defined-filter")) as {
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

            const privateFilterPropertyCallNode = {
                arguments: [],
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

            const nonCallbackFirstArgumentCallNode = {
                arguments: [
                    {
                        name: "predicate",
                        type: "Identifier",
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

            callExpressionListener?.(privateFilterPropertyCallNode);
            callExpressionListener?.(nonCallbackFirstArgumentCallNode);

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
    "declare const maybeNumbers: readonly unknown[];",
    "declare const maybeMonitors: readonly unknown[];",
    "declare const maybeStrings: readonly unknown[];",
    "",
    "const numbers = maybeNumbers.filter(",
    "    isDefined",
    ");",
    "const monitors = maybeMonitors.filter(",
    "    (monitor): monitor is MonitorRecord => monitor !== undefined",
    ");",
    "const strings = maybeStrings.filter((entry) => entry !== undefined);",
    "",
    "const totalCount = numbers.length + monitors.length + strings.length;",
    "if (totalCount < 0) {",
    '    throw new TypeError("Unreachable total count");',
    "}",
    "",
    'export const __typedFixtureModule = "typed-fixture-module";',
].join("\r\n");
const fixtureInvalidOutputWithMixedLineEndings = `import { isDefined } from "ts-extras";\n${fixtureInvalidOutput}\r\n`;
const fixtureInvalidSecondPassOutputWithMixedLineEndings =
    fixtureInvalidOutputWithMixedLineEndings
        .replace(
            "const monitors = maybeMonitors.filter(\r\n    (monitor): monitor is MonitorRecord => monitor !== undefined\r\n);\r\n",
            "const monitors = maybeMonitors.filter(\r\n    isDefined\r\n);\r\n"
        )
        .replace(
            "const strings = maybeStrings.filter((entry) => entry !== undefined);\r\n",
            "const strings = maybeStrings.filter(isDefined);\r\n"
        );

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                { messageId: "preferTsExtrasIsDefinedFilter" },
                { messageId: "preferTsExtrasIsDefinedFilter" },
                { messageId: "preferTsExtrasIsDefinedFilter" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture filter guards for undefined",
            output: [
                fixtureInvalidOutputWithMixedLineEndings,
                fixtureInvalidSecondPassOutputWithMixedLineEndings,
            ],
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports arrow predicate value !== undefined",
            output: inlineInvalidOutput,
        },
        {
            code: inlineInvalidRightSideCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports arrow predicate undefined !== value",
            output: inlineInvalidRightSideOutput,
        },
        {
            code: inlineInvalidLooseCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports arrow predicate value != undefined",
            output: inlineInvalidLooseOutput,
        },
        {
            code: inlineInvalidLooseRightSideCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports arrow predicate undefined != value",
            output: inlineInvalidLooseRightSideOutput,
        },
        {
            code: typeofInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports typeof undefined predicate",
            output: typeofInvalidOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedFilter" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes filter callback to isDefined when import is in scope",
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
            code: nonFilterValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-filter array method",
        },
        {
            code: noArgumentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores filter call without callback",
        },
        {
            code: functionExpressionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores function-expression callback",
        },
        {
            code: blockBodyArrowValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores block-body arrow callback",
        },
        {
            code: twoParamsArrowValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores callback using additional index parameter",
        },
        {
            code: destructuredParamValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores destructured callback parameter",
        },
        {
            code: typeofRightInvalidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores reversed typeof undefined comparison",
        },
        {
            code: strictEqualityUndefinedValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict equality comparison against undefined",
        },
        {
            code: nonUndefinedLooseComparisonValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores loose comparison against null",
        },
        {
            code: differentIdentifierComparisonValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined comparison using non-parameter identifier",
        },
        {
            code: undefinedAliasComparisonValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined alias identifier comparison",
        },
        {
            code: typeofNonUndefinedLiteralValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores typeof comparison against non-undefined literal",
        },
        {
            code: identifierBodyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores callback returning identifier directly",
        },
        {
            code: computedFilterValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores computed filter property access",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-ts-extras-is-defined-filter.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
