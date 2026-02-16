import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-array-includes");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-includes.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-includes.invalid.ts";

ruleTester.run("prefer-ts-extras-array-includes", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasArrayIncludes",
                },
                {
                    messageId: "preferTsExtrasArrayIncludes",
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
    ],
});
