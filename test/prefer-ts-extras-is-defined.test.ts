import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-defined.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-ts-extras-is-defined.skip.ts";
const invalidFixtureName = "prefer-ts-extras-is-defined.invalid.ts";

ruleTester.run(
    "prefer-ts-extras-is-defined",
    getPluginRule("prefer-ts-extras-is-defined"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    { messageId: "preferTsExtrasIsDefined" },
                    { messageId: "preferTsExtrasIsDefined" },
                    { messageId: "preferTsExtrasIsDefined" },
                    { messageId: "preferTsExtrasIsDefinedNegated" },
                    { messageId: "preferTsExtrasIsDefinedNegated" },
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
