/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-json-object.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-json-object");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-json-object.valid.ts";
const invalidFixtureName = "prefer-type-fest-json-object.invalid.ts";
const inlineInvalidLiteralStringKeyCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    'type MonitorJsonShape = Record<"string", JsonValue>;',
].join("\n");
const inlineValidGlobalRecordCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = globalThis.Record<string, JsonValue>;",
].join("\n");
const inlineValidNonJsonValueCode = [
    "type MonitorJsonShape = Record<string, number>;",
].join("\n");
const inlineValidNumberKeyCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = Record<number, JsonValue>;",
].join("\n");
const inlineValidMissingRecordTypeArgumentsCode =
    "type MonitorJsonShape = Record;";
const inlineValidRecordSingleTypeArgumentCode =
    "type MonitorJsonShape = Record<string>;";
const inlineValidRecordUnknownValueCode =
    "type MonitorJsonShape = Record<string, unknown>;";

ruleTester.run("prefer-type-fest-json-object", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferJsonObject",
                },
                {
                    messageId: "preferJsonObject",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidLiteralStringKeyCode,
            errors: [{ messageId: "preferJsonObject" }],
            filename: typedFixturePath(invalidFixtureName),
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidGlobalRecordCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidNonJsonValueCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidNumberKeyCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidMissingRecordTypeArgumentsCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidRecordSingleTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidRecordUnknownValueCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
        },
    ],
});
