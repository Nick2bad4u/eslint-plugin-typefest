/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-json-value.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const invalidFixtureName = "prefer-type-fest-json-value.invalid.ts";
const validFixtureName = "prefer-type-fest-json-value.valid.ts";
const inlineInvalidAnyPayloadCode = "type IpcPayload = Record<string, any>;";
const inlineValidGlobalRecordCode =
    "type IpcPayload = globalThis.Record<string, unknown>;";
const inlineValidNonStringKeyCode =
    "type IpcPayload = Record<number, unknown>;";
const inlineValidNonUnknownValueCode =
    "type IpcPayload = Record<string, string>;";
const inlineValidMapCode = "type IpcPayload = Map<string, unknown>;";

ruleTester.run(
    "prefer-type-fest-json-value",
    getPluginRule("prefer-type-fest-json-value"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [{ messageId: "preferJsonValue" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture Record<string, any> aliases",
            },
            {
                code: inlineInvalidAnyPayloadCode,
                errors: [{ messageId: "preferJsonValue" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports inline Record<string, any> alias",
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
                name: "ignores globalThis.Record<string, unknown>",
            },
            {
                code: inlineValidNonStringKeyCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores Record with non-string key type",
            },
            {
                code: inlineValidNonUnknownValueCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores Record with concrete value type",
            },
            {
                code: inlineValidMapCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-Record map type alias",
            },
            {
                code: readTypedFixture(invalidFixtureName),
                filename: typedFixturePath("tests", invalidFixtureName),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
