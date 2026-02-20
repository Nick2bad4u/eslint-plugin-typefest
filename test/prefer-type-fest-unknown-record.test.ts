/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unknown-record.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const invalidFixtureName = "prefer-type-fest-unknown-record.invalid.ts";
const validFixtureName = "prefer-type-fest-unknown-record.valid.ts";
const inlineValidGlobalRecordCode =
    "type SharedContext = globalThis.Record<string, unknown>;";
const inlineValidNonUnknownValueCode =
    "type SharedContext = Record<string, string>;";
const inlineValidNonStringKeyCode =
    "type SharedContext = Record<number, unknown>;";
const inlineInvalidRecordStringUnknownCode =
    "type SharedContext = Record<string, unknown>;";

ruleTester.run(
    "prefer-type-fest-unknown-record",
    getPluginRule("prefer-type-fest-unknown-record"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [{ messageId: "preferUnknownRecord" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture unknown record aliases",
            },
            {
                code: inlineInvalidRecordStringUnknownCode,
                errors: [{ messageId: "preferUnknownRecord" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports inline Record<string, unknown> alias",
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
                code: inlineValidNonUnknownValueCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores Record with non-unknown value type",
            },
            {
                code: inlineValidNonStringKeyCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores Record with non-string key type",
            },
            {
                code: readTypedFixture(invalidFixtureName),
                filename: typedFixturePath("tests", invalidFixtureName),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
