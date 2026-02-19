/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-non-empty-tuple.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-non-empty-tuple");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-non-empty-tuple.valid.ts";
const invalidFixtureName = "prefer-type-fest-non-empty-tuple.invalid.ts";
const inlineInvalidTupleCode = "type Input = readonly [string, ...string[]];";
const optionalFirstValidCode = "type Input = [first?: string, ...string[]];";
const restOnlyValidCode = "type Input = [...string[]];";
const mixedUnionValidCode =
    "type Input = [string, ...string[]] | [first?: string, ...string[]];";
const threeElementValidCode =
    "type Input = [string, number, ...string[]];";
const optionalReadonlyValidCode =
    "type Input = readonly [first?: string, ...string[]];";
const optionalTypeReadonlyValidCode =
    "type Input = readonly [string?, ...string[]];";
const namedRestInvalidCode =
    "type Input = readonly [string, ...rest: string[]];";
const nonArrayRestAnnotationValidCode =
    "type Input = readonly [string, ...rest: ReadonlyArray<string>];";
const mismatchedReadonlyValidCode =
    "type Input = readonly [string, ...number[]];";
const skipPathInvalidCode = inlineInvalidTupleCode;

ruleTester.run("prefer-type-fest-non-empty-tuple", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferNonEmptyTuple",
                },
                {
                    messageId: "preferNonEmptyTuple",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidTupleCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: namedRestInvalidCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: optionalFirstValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: restOnlyValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: mixedUnionValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: threeElementValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: optionalReadonlyValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: optionalTypeReadonlyValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: nonArrayRestAnnotationValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: mismatchedReadonlyValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-non-empty-tuple.skip.ts"
            ),
        },
    ],
});
