import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unknown-array.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-unknown-array");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-unknown-array.valid.ts";
const invalidFixtureName = "prefer-type-fest-unknown-array.invalid.ts";
const inlineInvalidReadonlyArrayCode = "type Input = readonly unknown[];";
const inlineValidArrayCode = "type Input = unknown[];";
const inlineValidAnyArrayCode = "type Input = readonly any[];";
const inlineValidNoTypeArgumentCode = "type Input = ReadonlyArray<string>;";
const inlineValidAnyTypeArgumentCode = "type Input = ReadonlyArray<any>;";
const inlineValidUnknownUnionTypeArgumentCode =
    "type Input = ReadonlyArray<unknown | string>;";
const inlineValidQualifiedReadonlyArrayCode =
    "type Input = globalThis.ReadonlyArray<unknown>;";
const inlineValidKeyofUnknownArrayCode = "type Input = keyof unknown[];";
const inlineInvalidReadonlyNonArrayOperatorCode =
    "type Input = readonly ReadonlyArray<unknown>;";
const inlineValidMissingReadonlyArrayTypeArgumentCode =
    "type Input = ReadonlyArray;";
const inlineValidExtraReadonlyArrayTypeArgumentCode =
    "type Input = ReadonlyArray<unknown, string>;";
const inlineValidNestedUnknownArrayTypeArgumentCode =
    "type Input = ReadonlyArray<unknown[]>;";
const skipPathInvalidCode = inlineInvalidReadonlyArrayCode;
const inlineInvalidWithoutFixCode = "type Input = ReadonlyArray<unknown>;";
const inlineReadonlyNonArrayOperatorFixableCode = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = readonly ReadonlyArray<unknown>;",
].join("\n");
const inlineReadonlyNonArrayOperatorFixableOutput = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = readonly UnknownArray;",
].join("\n");
const inlineReadonlyShorthandFixableCode = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = readonly unknown[];",
].join("\n");
const inlineReadonlyShorthandFixableOutput = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = UnknownArray;",
].join("\n");
const inlineFixableCode = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = ReadonlyArray<unknown>;",
].join("\n");
const inlineFixableOutput = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = UnknownArray;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-unknown-array",
    {
        docsDescription:
            "require TypeFest UnknownArray over readonly unknown[] and ReadonlyArray<unknown> aliases.",
        enforceRuleShape: true,
        messages: {
            preferUnknownArray:
                "Prefer `UnknownArray` from type-fest over `readonly unknown[]` or `ReadonlyArray<unknown>`.",
        },
    }
);

ruleTester.run("prefer-type-fest-unknown-array", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferUnknownArray",
                },
                {
                    messageId: "preferUnknownArray",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture readonly unknown array aliases",
        },
        {
            code: inlineInvalidReadonlyArrayCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly unknown array shorthand alias",
            output: null,
        },
        {
            code: inlineInvalidReadonlyNonArrayOperatorCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly operator over unknown[] type reference",
            output: null,
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports ReadonlyArray<unknown> even when UnknownArray import is missing",
            output: null,
        },
        {
            code: inlineReadonlyShorthandFixableCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes readonly unknown[] when UnknownArray import is in scope",
            output: inlineReadonlyShorthandFixableOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes ReadonlyArray<unknown> when UnknownArray import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineReadonlyNonArrayOperatorFixableCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes nested ReadonlyArray<unknown> inside readonly type operator when UnknownArray import is in scope",
            output: inlineReadonlyNonArrayOperatorFixableOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable unknown array shorthand",
        },
        {
            code: inlineValidAnyArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly any array shorthand",
        },
        {
            code: inlineValidNoTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly array with concrete element type",
        },
        {
            code: inlineValidAnyTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray<any>",
        },
        {
            code: inlineValidUnknownUnionTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray where type argument is not exactly unknown",
        },
        {
            code: inlineValidQualifiedReadonlyArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.ReadonlyArray qualified type reference",
        },
        {
            code: inlineValidKeyofUnknownArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores keyof unknown[] type query",
        },
        {
            code: inlineValidMissingReadonlyArrayTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray without explicit unknown element",
        },
        {
            code: inlineValidExtraReadonlyArrayTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray with extra type arguments",
        },
        {
            code: inlineValidNestedUnknownArrayTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray with nested unknown[] element type",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-unknown-array.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
