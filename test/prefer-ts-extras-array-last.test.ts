import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-array-last");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-last.valid.ts";
const patternValidFixtureName =
    "prefer-ts-extras-array-last.patterns.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-last.invalid.ts";
const skipFixtureName = "tests/prefer-ts-extras-array-last.skip.ts";

ruleTester.run("prefer-ts-extras-array-last", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasArrayLast",
                },
                {
                    messageId: "preferTsExtrasArrayLast",
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
            code: readTypedFixture(patternValidFixtureName),
            filename: typedFixturePath(patternValidFixtureName),
        },
        {
            code: readTypedFixture(skipFixtureName),
            filename: typedFixturePath(skipFixtureName),
        },
    ],
});
