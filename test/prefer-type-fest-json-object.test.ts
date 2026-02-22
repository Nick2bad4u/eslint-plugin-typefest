import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
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
const inlineValidLiteralNonStringKeyCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    'type MonitorJsonShape = Record<"number", JsonValue>;',
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
const inlineInvalidWithoutFixCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = Record<string, JsonValue>;",
].join("\n");
const inlineFixableCode = [
    'import type { JsonObject, JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = Record<string, JsonValue>;",
].join("\n");
const inlineFixableOutput = [
    'import type { JsonObject, JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = JsonObject;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-json-object",
    {
        docsDescription:
            "require TypeFest JsonObject over equivalent Record<string, JsonValue> object aliases.",
        enforceRuleShape: true,
        messages: {
            preferJsonObject:
                "Prefer `JsonObject` from type-fest over equivalent explicit JSON-object type shapes.",
        },
    }
);

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
            name: "reports fixture JsonObject-like Record aliases",
        },
        {
            code: inlineInvalidLiteralStringKeyCode,
            errors: [{ messageId: "preferJsonObject" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Record with literal string key and JsonValue value",
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferJsonObject" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Record<string, JsonValue> without fix when JsonObject import is missing",
            output: null,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferJsonObject" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Record<string, JsonValue> when JsonObject import is in scope",
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
            code: inlineValidGlobalRecordCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.Record usage",
        },
        {
            code: inlineValidLiteralNonStringKeyCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with literal key other than \"string\"",
        },
        {
            code: inlineValidNonJsonValueCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with non-JsonValue values",
        },
        {
            code: inlineValidNumberKeyCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with non-string key type",
        },
        {
            code: inlineValidMissingRecordTypeArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores bare Record reference",
        },
        {
            code: inlineValidRecordSingleTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with a single type argument",
        },
        {
            code: inlineValidRecordUnknownValueCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record<string, unknown>",
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
