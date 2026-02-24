/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-array-first.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-array-first");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-first.valid.ts";
const writeTargetValidFixtureName =
    "prefer-ts-extras-array-first.write-target.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-first.invalid.ts";
const inlineInvalidUnionArrayCode = [
    "declare const monitorStatuses: readonly string[] | readonly number[];",
    "const firstStatus = monitorStatuses[0];",
    "String(firstStatus);",
].join("\n");
const inlineInvalidUnionArrayOutput = [
    'import { arrayFirst } from "ts-extras";',
    "declare const monitorStatuses: readonly string[] | readonly number[];",
    "const firstStatus = arrayFirst(monitorStatuses);",
    "String(firstStatus);",
].join("\n");
const inlineInvalidStringZeroCode = [
    "declare const monitorStatuses: readonly string[];",
    'const firstStatus = monitorStatuses["0"];',
    "String(firstStatus);",
].join("\n");
const inlineInvalidStringZeroOutput = [
    'import { arrayFirst } from "ts-extras";',
    "declare const monitorStatuses: readonly string[];",
    "const firstStatus = arrayFirst(monitorStatuses);",
    "String(firstStatus);",
].join("\n");
const inlineInvalidUnaryVoidCode = [
    "declare const monitorStatuses: readonly string[];",
    "void monitorStatuses[0];",
].join("\n");
const inlineInvalidUnaryVoidOutput = [
    'import { arrayFirst } from "ts-extras";',
    "declare const monitorStatuses: readonly string[];",
    "void arrayFirst(monitorStatuses);",
].join("\n");
const inlineValidDeleteWriteTargetCode = [
    "const mutableStatuses = ['down', 'up'];",
    "delete mutableStatuses[0];",
    "String(mutableStatuses);",
].join("\n");
const inlineFixableCode = [
    'import { arrayFirst } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const first = sample[0];",
].join("\n");
const inlineFixableOutput = [
    'import { arrayFirst } from "ts-extras";',
    "",
    "const sample = [1, 2, 3] as const;",
    "const first = arrayFirst(sample);",
].join("\n");

ruleTester.run("prefer-ts-extras-array-first", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasArrayFirst",
                },
                {
                    messageId: "preferTsExtrasArrayFirst",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture index-zero array reads",
        },
        {
            code: inlineInvalidUnionArrayCode,
            errors: [{ messageId: "preferTsExtrasArrayFirst" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports index-zero read on readonly array union",
            output: inlineInvalidUnionArrayOutput,
        },
        {
            code: inlineInvalidStringZeroCode,
            errors: [{ messageId: "preferTsExtrasArrayFirst" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports string-literal zero index access",
            output: inlineInvalidStringZeroOutput,
        },
        {
            code: inlineInvalidUnaryVoidCode,
            errors: [{ messageId: "preferTsExtrasArrayFirst" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports unary-void index-zero read",
            output: inlineInvalidUnaryVoidOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasArrayFirst" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes array[0] when arrayFirst import is in scope",
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
            code: readTypedFixture(writeTargetValidFixtureName),
            filename: typedFixturePath(writeTargetValidFixtureName),
            name: "accepts fixture write-target index operations",
        },
        {
            code: inlineValidDeleteWriteTargetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores delete write-target index usage",
        },
    ],
});
