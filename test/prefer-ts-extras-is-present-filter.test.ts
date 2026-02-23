/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-present-filter.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

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
    "prefer-ts-extras-is-present-filter",
    getPluginRule("prefer-ts-extras-is-present-filter"),
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
