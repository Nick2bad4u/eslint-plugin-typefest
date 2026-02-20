/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-literal-union.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-literal-union.valid.ts";
const invalidFixtureName = "prefer-type-fest-literal-union.invalid.ts";
const skipFixtureName = "tests/prefer-type-fest-literal-union.skip.ts";
const inlineInvalidBigIntLiteralUnionCode = "type SessionNonce = bigint | 1n;";
const inlineFixableCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type EnvironmentName = 'dev' | 'prod' | string;",
].join("\n");
const inlineFixableOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type EnvironmentName = LiteralUnion<'dev' | 'prod', string>;",
].join("\n");

ruleTester.run(
    "prefer-type-fest-literal-union",
    getPluginRule("prefer-type-fest-literal-union"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferLiteralUnion",
                    },
                    {
                        messageId: "preferLiteralUnion",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture literal plus base type unions",
            },
            {
                code: inlineInvalidBigIntLiteralUnionCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports bigint base plus bigint literal union",
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes primitive+literal union when LiteralUnion import is in scope",
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
                code: readTypedFixture(skipFixtureName),
                filename: typedFixturePath(skipFixtureName),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
