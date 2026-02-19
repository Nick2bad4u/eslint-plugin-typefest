/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-merge-exclusive.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-merge-exclusive.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-merge-exclusive.skip.ts";
const invalidFixtureName = "prefer-type-fest-merge-exclusive.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { XOR } from "type-aliases";',
    'import type { MergeExclusive } from "type-fest";',
    "",
    "type A = { a: string };",
    "type B = { b: string };",
    "",
    "type AB = XOR<A, B>;",
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type AB = XOR<A, B>;",
    "type AB = MergeExclusive<A, B>;"
);

ruleTester.run(
    "prefer-type-fest-merge-exclusive",
    getPluginRule("prefer-type-fest-merge-exclusive"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [{ messageId: "preferMergeExclusive" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferMergeExclusive" }],
                filename: typedFixturePath(invalidFixtureName),
                output: inlineFixableOutputCode,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: readTypedFixture(
                    skipTestPathFixtureDirectory,
                    skipTestPathFixtureName
                ),
                filename: typedFixturePath(
                    skipTestPathFixtureDirectory,
                    skipTestPathFixtureName
                ),
            },
        ],
    }
);
