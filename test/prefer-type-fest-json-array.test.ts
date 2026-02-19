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
        },
        {
            code: inlineInvalidReversedNativeUnionCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidReversedGenericUnionCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidMismatchedNativeAndGenericCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidNonJsonElementCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidThreeMemberUnionCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidReadonlyArrayTypeMismatchCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidMissingGenericArgumentsCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidMissingReadonlyGenericArgumentsCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidQualifiedArrayTypeCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidReadonlyOperatorNonArrayTypeCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
        },
    ],
});
