/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-json-array.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-json-array");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-json-array.valid.ts";
const invalidFixtureName = "prefer-type-fest-json-array.invalid.ts";
const inlineInvalidReversedNativeUnionCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type ReversedNative = readonly JsonValue[] | JsonValue[];",
].join("\n");
const inlineInvalidReversedGenericUnionCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type ReversedGeneric = ReadonlyArray<JsonValue> | Array<JsonValue>;",
].join("\n");
const inlineValidMismatchedNativeAndGenericCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = JsonValue[] | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineValidNonJsonElementCode = [
    "type NotJsonArray = Array<string> | ReadonlyArray<string>;",
].join("\n");
const inlineValidThreeMemberUnionCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = JsonValue[] | readonly JsonValue[] | null;",
].join("\n");
const inlineValidReadonlyArrayTypeMismatchCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = JsonValue[] | readonly string[];",
].join("\n");
const inlineValidMissingGenericArgumentsCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = Array | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineValidMissingReadonlyGenericArgumentsCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = Array<JsonValue> | ReadonlyArray;",
].join("\n");
const inlineValidQualifiedArrayTypeCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = globalThis.Array<JsonValue> | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineValidReadonlyOperatorNonArrayTypeCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = readonly ReadonlyArray<JsonValue> | JsonValue[];",
].join("\n");
const inlineFixableCode = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = JsonValue[] | readonly JsonValue[];",
].join("\n");
const inlineFixableOutput = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = JsonArray;",
].join("\n");

ruleTester.run("prefer-type-fest-json-array", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferJsonArray",
                },
                {
                    messageId: "preferJsonArray",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture JsonArray-like unions",
        },
        {
            code: inlineInvalidReversedNativeUnionCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reversed native array union",
        },
        {
            code: inlineInvalidReversedGenericUnionCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reversed generic array union",
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes JsonValue array union when JsonArray import is in scope",
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
            code: inlineValidMismatchedNativeAndGenericCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mixed native and generic array forms",
        },
        {
            code: inlineValidNonJsonElementCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-JsonValue element array union",
        },
        {
            code: inlineValidThreeMemberUnionCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores unions with more than two members",
        },
        {
            code: inlineValidReadonlyArrayTypeMismatchCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly array element type mismatch",
        },
        {
            code: inlineValidMissingGenericArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Array without generic arguments",
        },
        {
            code: inlineValidMissingReadonlyGenericArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray without generic arguments",
        },
        {
            code: inlineValidQualifiedArrayTypeCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.Array qualified union",
        },
        {
            code: inlineValidReadonlyOperatorNonArrayTypeCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly operator applied to non-array reference",
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
