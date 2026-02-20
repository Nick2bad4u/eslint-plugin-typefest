/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-arrayable.valid.ts";
const invalidFixtureName = "prefer-type-fest-arrayable.invalid.ts";

const inlineInvalidCode = "type QueryValue = string | string[];";
const inlineInvalidReversedCode = "type QueryValue = string[] | string;";
const inlineInvalidReadonlyArrayCode =
    "type QueryValue = string | readonly string[];";
const inlineInvalidGenericArrayCode =
    "type QueryValue = string | Array<string>;";
const inlineInvalidGenericArrayReversedCode =
    "type QueryValue = Array<string> | string;";

const nonMatchingUnionValidCode = "type QueryValue = string | number[];";
const singleTypeValidCode = "type QueryValue = string;";
const threeMemberUnionValidCode = "type QueryValue = string | string[] | null;";
const genericArrayMissingTypeArgumentValidCode =
    "type QueryValue = string | Array;";
const genericArrayMismatchedElementValidCode =
    "type QueryValue = string | Array<number>;";
const inlineFixableCode = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = string | string[];",
].join("\n");
const inlineFixableOutput = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = Arrayable<string>;",
].join("\n");

const skipPathInvalidCode = inlineInvalidCode;

ruleTester.run(
    "prefer-type-fest-arrayable",
    getPluginRule("prefer-type-fest-arrayable"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    { messageId: "preferArrayable" },
                    { messageId: "preferArrayable" },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture string-or-array unions",
            },
            {
                code: inlineInvalidCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports string | string[] union",
            },
            {
                code: inlineInvalidReversedCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports reversed string[] | string union",
            },
            {
                code: inlineInvalidGenericArrayCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports string | Array<string> union",
            },
            {
                code: inlineInvalidGenericArrayReversedCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports reversed Array<string> | string union",
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes T | T[] union when Arrayable import is in scope",
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
                code: nonMatchingUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with mismatched array element types",
            },
            {
                code: singleTypeValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores single non-union type alias",
            },
            {
                code: threeMemberUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with more than two members",
            },
            {
                code: genericArrayMissingTypeArgumentValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores generic array without type arguments",
            },
            {
                code: genericArrayMismatchedElementValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores generic array with mismatched element type",
            },
            {
                code: inlineInvalidReadonlyArrayCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores readonly array unions already matching Arrayable semantics",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-type-fest-arrayable.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
