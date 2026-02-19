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

const nonMatchingUnionValidCode = "type QueryValue = string | number[];";
const singleTypeValidCode = "type QueryValue = string;";

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
            },
            {
                code: inlineInvalidCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineInvalidReversedCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: nonMatchingUnionValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: singleTypeValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineInvalidReadonlyArrayCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-type-fest-arrayable.skip.ts"
                ),
            },
        ],
    }
);
