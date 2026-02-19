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
            },
            {
                code: inlineInvalidAnyPayloadCode,
                errors: [{ messageId: "preferJsonValue" }],
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
                code: inlineValidNonStringKeyCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidNonUnknownValueCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidMapCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: readTypedFixture(invalidFixtureName),
                filename: typedFixturePath("tests", invalidFixtureName),
            },
        ],
    }
);
