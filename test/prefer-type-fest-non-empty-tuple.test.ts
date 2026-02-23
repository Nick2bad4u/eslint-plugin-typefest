import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
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
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { NonEmptyTuple } from "type-fest";\n${invalidFixtureCode.replace(
    "type NamedNonEmptyTuple = readonly [first: number, ...rest: number[]];",
    "type NamedNonEmptyTuple = NonEmptyTuple<number>;"
)}`;
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "type VerboseNonEmptyTuple = readonly [string, ...string[]];",
    "type VerboseNonEmptyTuple = NonEmptyTuple<string>;"
);
const inlineInvalidTupleCode = "type Input = readonly [string, ...string[]];";
const inlineInvalidTupleOutputCode = [
    'import type { NonEmptyTuple } from "type-fest";',
    "type Input = NonEmptyTuple<string>;",
].join("\n");
const optionalFirstValidCode = "type Input = [first?: string, ...string[]];";
const restOnlyValidCode = "type Input = [...string[]];";
const mixedUnionValidCode =
    "type Input = [string, ...string[]] | [first?: string, ...string[]];";
const threeElementValidCode = "type Input = [string, number, ...string[]];";
const readonlyTrailingElementAfterRestValidCode =
    "type Input = readonly [string, ...string[], number];";
const optionalReadonlyValidCode =
    "type Input = readonly [first?: string, ...string[]];";
const optionalTypeReadonlyValidCode =
    "type Input = readonly [string?, ...string[]];";
const namedRestInvalidCode =
    "type Input = readonly [string, ...rest: string[]];";
const namedRestInvalidOutputCode = [
    'import type { NonEmptyTuple } from "type-fest";',
    "type Input = NonEmptyTuple<string>;",
].join("\n");
const namedHeadInvalidCode =
    "type Input = readonly [head: string, ...string[]];";
const namedHeadInvalidOutputCode = [
    'import type { NonEmptyTuple } from "type-fest";',
    "type Input = NonEmptyTuple<string>;",
].join("\n");
const whitespaceNormalizedInvalidCode =
    "type Input = readonly [Map < string , number >, ...Map<string, number>[]];";
const whitespaceNormalizedInvalidOutputCode = [
    'import type { NonEmptyTuple } from "type-fest";',
    "type Input = NonEmptyTuple<Map < string , number >>;",
].join("\n");
const nonArrayRestAnnotationValidCode =
    "type Input = readonly [string, ...rest: ReadonlyArray<string>];";
const mismatchedReadonlyValidCode =
    "type Input = readonly [string, ...number[]];";
const nonReadonlyOperatorValidCode =
    "type Input = keyof [string, ...string[]];";
const readonlyNonTupleTypeValidCode = "type Input = readonly string[];";
const readonlySingleElementTupleValidCode = "type Input = readonly [string];";
const readonlyEmptyTupleValidCode = "type Input = readonly [];";
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

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-non-empty-tuple",
    {
        docsDescription:
            "require TypeFest NonEmptyTuple over readonly [T, ...T[]] tuple patterns.",
        enforceRuleShape: true,
        messages: {
            preferNonEmptyTuple:
                "Prefer `NonEmptyTuple<T>` from type-fest over `readonly [T, ...T[]]`.",
        },
    }
);

ruleTester.run("prefer-type-fest-non-empty-tuple", rule, {
    invalid: [
        {
            code: invalidFixtureCode,
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
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidTupleCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly tuple with required head element",
            output: inlineInvalidTupleOutputCode,
        },
        {
            code: namedRestInvalidCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly tuple with named rest element",
            output: namedRestInvalidOutputCode,
        },
        {
            code: namedHeadInvalidCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly tuple with named required head element",
            output: namedHeadInvalidOutputCode,
        },
        {
            code: whitespaceNormalizedInvalidCode,
            errors: [{ messageId: "preferNonEmptyTuple" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly tuple when first and rest element text only differ by whitespace",
            output: whitespaceNormalizedInvalidOutputCode,
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
            code: readonlyTrailingElementAfterRestValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly tuple with trailing element after rest",
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
            code: readonlyEmptyTupleValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly empty tuple",
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
