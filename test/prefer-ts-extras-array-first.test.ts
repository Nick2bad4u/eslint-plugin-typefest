import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-array-first");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-first.valid.ts";
const writeTargetValidFixtureName =
    "prefer-ts-extras-array-first.write-target.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-first.invalid.ts";
const skipFixtureName = "tests/prefer-ts-extras-array-first.skip.ts";

ruleTester.run("prefer-ts-extras-array-first", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasArrayFirst",
                },
                {
                    messageId: "preferTsExtrasArrayFirst",
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
            code: readTypedFixture(writeTargetValidFixtureName),
            filename: typedFixturePath(writeTargetValidFixtureName),
        },
        {
            code: readTypedFixture(skipFixtureName),
            filename: typedFixturePath(skipFixtureName),
        },
    ],
});
