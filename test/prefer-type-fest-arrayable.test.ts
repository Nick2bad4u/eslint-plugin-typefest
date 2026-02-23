import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
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
const inlineInvalidWhitespaceNormalizedGenericArrayCode =
    "type QueryValue = Map < string , number > | Array<Map<string, number>>;";
const inlineInvalidWhitespaceNormalizedGenericArrayReversedCode =
    "type QueryValue = Array<Map < string , number >> | Map<string, number>;";

const nonMatchingUnionValidCode = "type QueryValue = string | number[];";
const singleTypeValidCode = "type QueryValue = string;";
const threeMemberUnionValidCode = "type QueryValue = string | string[] | null;";
const genericArrayMissingTypeArgumentValidCode =
    "type QueryValue = string | Array;";
const genericArrayExtraTypeArgumentValidCode =
    "type QueryValue = string | Array<string, number>;";
const genericArrayMismatchedElementValidCode =
    "type QueryValue = string | Array<number>;";
const qualifiedGenericArrayValidCode =
    "type QueryValue = string | globalThis.Array<string>;";
const bothMembersAreNativeArraysValidCode =
    "type QueryValue = string[] | string[];";
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
const inlineGenericFixableCode = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = string | Array<string>;",
].join("\n");
const inlineGenericFixableOutput = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = Arrayable<string>;",
].join("\n");
const inlineGenericFixableReversedCode = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = Array<string> | string;",
].join("\n");
const inlineGenericFixableReversedOutput = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = Arrayable<string>;",
].join("\n");
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { Arrayable } from "type-fest";\n${invalidFixtureCode.replace(
    "Array<number> | number",
    "Arrayable<number>"
)}`;
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "string | string[]",
    "Arrayable<string>"
);
const inlineInvalidOutputCode = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<string>;",
].join("\n");
const inlineInvalidReversedOutputCode = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<string>;",
].join("\n");
const inlineInvalidGenericArrayOutputCode = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<string>;",
].join("\n");
const inlineInvalidGenericArrayReversedOutputCode = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<string>;",
].join("\n");
const inlineInvalidWhitespaceNormalizedGenericArrayOutputCode = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<Map < string , number >>;",
].join("\n");
const inlineInvalidWhitespaceNormalizedGenericArrayReversedOutputCode = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<Map<string, number>>;",
].join("\n");

const skipPathInvalidCode = inlineInvalidCode;

addTypeFestRuleMetadataAndFilenameFallbackTests("prefer-type-fest-arrayable", {
    docsDescription:
        "require TypeFest Arrayable over T | T[] and T | Array<T> unions.",
    enforceRuleShape: true,
    messages: {
        preferArrayable:
            "Prefer `Arrayable<T>` from type-fest over `T | T[]` or `T | Array<T>` unions.",
    },
});

ruleTester.run(
    "prefer-type-fest-arrayable",
    getPluginRule("prefer-type-fest-arrayable"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    { messageId: "preferArrayable" },
                    { messageId: "preferArrayable" },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture string-or-array unions",
                output: [
                    fixtureFixableOutputCode,
                    fixtureFixableSecondPassOutputCode,
                ],
            },
            {
                code: inlineInvalidCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports string | string[] union",
                output: inlineInvalidOutputCode,
            },
            {
                code: inlineInvalidReversedCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports reversed string[] | string union",
                output: inlineInvalidReversedOutputCode,
            },
            {
                code: inlineInvalidGenericArrayCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports string | Array<string> union",
                output: inlineInvalidGenericArrayOutputCode,
            },
            {
                code: inlineInvalidGenericArrayReversedCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports reversed Array<string> | string union",
                output: inlineInvalidGenericArrayReversedOutputCode,
            },
            {
                code: inlineInvalidWhitespaceNormalizedGenericArrayCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports generic unions when element text only differs by whitespace",
                output: inlineInvalidWhitespaceNormalizedGenericArrayOutputCode,
            },
            {
                code: inlineInvalidWhitespaceNormalizedGenericArrayReversedCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports reversed generic unions when element text only differs by whitespace",
                output: inlineInvalidWhitespaceNormalizedGenericArrayReversedOutputCode,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes T | T[] union when Arrayable import is in scope",
                output: inlineFixableOutput,
            },
            {
                code: inlineGenericFixableCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes T | Array<T> union when Arrayable import is in scope",
                output: inlineGenericFixableOutput,
            },
            {
                code: inlineGenericFixableReversedCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes reversed Array<T> | T union when Arrayable import is in scope",
                output: inlineGenericFixableReversedOutput,
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
                code: genericArrayExtraTypeArgumentValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores generic array with extra type arguments",
            },
            {
                code: genericArrayMismatchedElementValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores generic array with mismatched element type",
            },
            {
                code: bothMembersAreNativeArraysValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions where both members are native arrays",
            },
            {
                code: qualifiedGenericArrayValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores globalThis.Array qualified generic unions",
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
