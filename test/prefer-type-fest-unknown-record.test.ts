import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
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
const ruleId = "prefer-type-fest-unknown-record";
const docsDescription =
    "require TypeFest UnknownRecord over Record<string, unknown> in architecture-critical layers.";
const preferUnknownRecordMessage =
    "Prefer `UnknownRecord` from type-fest over `Record<string, unknown>` for clearer intent and stronger shared typing conventions.";

const invalidFixtureName = "prefer-type-fest-unknown-record.invalid.ts";
const validFixtureName = "prefer-type-fest-unknown-record.valid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { UnknownRecord } from "type-fest";\n${invalidFixtureCode.replace(
    "Record<string, unknown>",
    "UnknownRecord"
)}`;
const inlineValidGlobalRecordCode =
    "type SharedContext = globalThis.Record<string, unknown>;";
const inlineValidNonUnknownValueCode =
    "type SharedContext = Record<string, string>;";
const inlineValidNonStringKeyCode =
    "type SharedContext = Record<number, unknown>;";
const inlineValidNonRecordIdentifierCode = [
    "type Box<KeyType, ValueType> = {",
    "    key: KeyType;",
    "    value: ValueType;",
    "};",
    "type SharedContext = Box<string, unknown>;",
].join("\n");
const inlineInvalidRecordStringUnknownCode =
    "type SharedContext = Record<string, unknown>;";
const inlineInvalidRecordStringUnknownOutput = [
    'import type { UnknownRecord } from "type-fest";',
    "type SharedContext = UnknownRecord;",
].join("\n");
const inlineFixableCode = [
    'import type { UnknownRecord } from "type-fest";',
    "",
    "type SharedContext = Record<string, unknown>;",
].join("\n");
const inlineFixableOutput = [
    'import type { UnknownRecord } from "type-fest";',
    "",
    "type SharedContext = UnknownRecord;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferUnknownRecord: preferUnknownRecordMessage,
    },
    name: ruleId,
});

ruleTester.run(
    ruleId,
    getPluginRule(ruleId),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [{ messageId: "preferUnknownRecord" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture unknown record aliases",
                output: fixtureFixableOutputCode,
            },
            {
                code: inlineInvalidRecordStringUnknownCode,
                errors: [{ messageId: "preferUnknownRecord" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports inline Record<string, unknown> alias",
                output: inlineInvalidRecordStringUnknownOutput,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferUnknownRecord" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes Record<string, unknown> when UnknownRecord import is in scope",
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
                code: inlineValidNonRecordIdentifierCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-Record generic with string unknown type arguments",
            },
            {
                code: readTypedFixture(invalidFixtureName),
                filename: typedFixturePath("tests", invalidFixtureName),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
