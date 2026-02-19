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
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: readTypedFixture(skipFixtureName),
                filename: typedFixturePath(skipFixtureName),
            },
        ],
    }
);
