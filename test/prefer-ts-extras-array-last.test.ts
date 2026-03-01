/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-array-last.test` behavior.
 */
import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-array-last");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-last.valid.ts";
const patternValidFixtureName = "prefer-ts-extras-array-last.patterns.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-last.invalid.ts";
const inlineInvalidUnionArrayCode = [
    "declare const monitorStatuses: readonly string[] | readonly number[];",
    "const lastStatus = monitorStatuses[monitorStatuses.length - 1];",
    "String(lastStatus);",
].join("\n");
const inlineInvalidUnionArrayOutput = [
    'import { arrayLast } from "ts-extras";',
    "declare const monitorStatuses: readonly string[] | readonly number[];",
    "const lastStatus = arrayLast(monitorStatuses);",
    "String(lastStatus);",
].join("\n");
const inlineInvalidTupleCode = [
    "const monitorStatuses: [string, string] = ['down', 'up'];",
    "const lastStatus = monitorStatuses[monitorStatuses.length - 1];",
    "String(lastStatus);",
].join("\n");
const inlineInvalidTupleOutput = [
    'import { arrayLast } from "ts-extras";',
    "const monitorStatuses: [string, string] = ['down', 'up'];",
    "const lastStatus = arrayLast(monitorStatuses);",
    "String(lastStatus);",
].join("\n");
const inlineValidDeleteWriteTargetCode = [
    "const mutableStatuses = ['down', 'up'];",
    "delete mutableStatuses[mutableStatuses.length - 1];",
    "String(mutableStatuses);",
].join("\n");
const inlineValidNonLiteralOffsetCode = [
    "const monitorStatuses = ['down', 'up'];",
    "const offset = 1;",
    "const maybeLast = monitorStatuses[monitorStatuses.length - offset];",
    "String(maybeLast);",
].join("\n");
const inlineValidSuperLastIndexCode = [
    "class StatusHistory extends Array<string> {",
    "    getLatest(): string | undefined {",
    "        return super[super.length - 1];",
    "    }",
    "}",
    "const statuses = new StatusHistory('down', 'up');",
    "String(statuses.getLatest());",
].join("\n");
const inlineFixableCode = [
    'import { arrayLast } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const last = sample[sample.length - 1];",
].join("\n");
const inlineFixableOutput = [
    'import { arrayLast } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const last = arrayLast(sample);",
].join("\n");
const inlineParenthesizedObjectCode = [
    'import { arrayLast } from "ts-extras";',
    "",
    "const monitorStatuses = ['healthy', 'degraded'];",
    "const lastStatus = (monitorStatuses)[(monitorStatuses).length - 1];",
    "String(lastStatus);",
].join("\n");
const inlineParenthesizedObjectOutput = [
    'import { arrayLast } from "ts-extras";',
    "",
    "const monitorStatuses = ['healthy', 'degraded'];",
    "const lastStatus = arrayLast(monitorStatuses);",
    "String(lastStatus);",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests("prefer-ts-extras-array-last", {
    defaultOptions: [],
    docsDescription:
        "require `arrayLast` from `ts-extras` instead of manual last-index member access.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasArrayLast:
            "Prefer `arrayLast` from `ts-extras` over direct last-index access.",
    },
    name: "prefer-ts-extras-array-last",
});

ruleTester.run("prefer-ts-extras-array-last", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasArrayLast",
                },
                {
                    messageId: "preferTsExtrasArrayLast",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture last-index array reads",
        },
        {
            code: inlineInvalidUnionArrayCode,
            errors: [{ messageId: "preferTsExtrasArrayLast" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports last-index read on readonly array union",
            output: inlineInvalidUnionArrayOutput,
        },
        {
            code: inlineInvalidTupleCode,
            errors: [{ messageId: "preferTsExtrasArrayLast" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports tuple last-index read via length arithmetic",
            output: inlineInvalidTupleOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasArrayLast" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes array[array.length - 1] when arrayLast import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineParenthesizedObjectCode,
            errors: [{ messageId: "preferTsExtrasArrayLast" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes parenthesized object array[array.length - 1] patterns",
            output: inlineParenthesizedObjectOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: readTypedFixture(patternValidFixtureName),
            filename: typedFixturePath(patternValidFixtureName),
            name: "accepts fixture pattern-safe variants",
        },
        {
            code: inlineValidDeleteWriteTargetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores delete write-target last index usage",
        },
        {
            code: inlineValidNonLiteralOffsetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores last-index arithmetic when right operand is not the literal 1",
        },
        {
            code: inlineValidSuperLastIndexCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores super-based last-index reads",
        },
    ],
});
