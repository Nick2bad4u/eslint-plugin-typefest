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
const threeElementValidCode = "type Input = [string, number, ...string[]];";
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
const nonReadonlyOperatorValidCode =
    "type Input = keyof [string, ...string[]];";
const readonlyNonTupleTypeValidCode = "type Input = readonly string[];";
const readonlySingleElementTupleValidCode = "type Input = readonly [string];";
const skipPathInvalidCode = inlineInvalidTupleCode;
const inlineFixableCode = [
    'import type { NonEmptyTuple } from "type-fest";',
    "",
    "type Input = readonly [string, ...string[]];",
].join("\n");
const inlineFixableOutput = [
    'import type { NonEmptyTuple } from "type-fest";',
    "",
    "type Input = NonEmptyTuple<string>;",
].join("\n");

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
            name: "reports fixture readonly non-empty tuple aliases",
        },
        {
            code: inlineInvalidTupleCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly tuple with required head element",
        },
        {
            code: namedRestInvalidCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly tuple with named rest element",
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes readonly [T, ...T[]] when NonEmptyTuple import is in scope",
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
            code: optionalFirstValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores tuple with optional first element",
        },
        {
            code: restOnlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores tuple containing only rest elements",
        },
        {
            code: mixedUnionValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mixed union with optional tuple variant",
        },
        {
            code: threeElementValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores tuple with multiple required leading elements",
        },
        {
            code: optionalReadonlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly tuple with optional named head",
        },
        {
            code: optionalTypeReadonlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly tuple with optional shorthand head",
        },
        {
            code: nonArrayRestAnnotationValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores tuple rest annotated as ReadonlyArray",
        },
        {
            code: mismatchedReadonlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly tuple with mismatched rest type",
        },
        {
            code: nonReadonlyOperatorValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores tuple in non-readonly type operator context",
        },
        {
            code: readonlyNonTupleTypeValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly array type alias",
        },
        {
            code: readonlySingleElementTupleValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly tuple with single element",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-non-empty-tuple.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
