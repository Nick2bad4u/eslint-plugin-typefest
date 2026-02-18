/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-present.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-present.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-ts-extras-is-present.skip.ts";
const invalidFixtureName = "prefer-ts-extras-is-present.invalid.ts";

ruleTester.run(
    "prefer-ts-extras-is-present",
    getPluginRule("prefer-ts-extras-is-present"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    { messageId: "preferTsExtrasIsPresent" },
                    { messageId: "preferTsExtrasIsPresent" },
                    { messageId: "preferTsExtrasIsPresentNegated" },
                    { messageId: "preferTsExtrasIsPresent" },
                    { messageId: "preferTsExtrasIsPresent" },
                    { messageId: "preferTsExtrasIsPresentNegated" },
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
