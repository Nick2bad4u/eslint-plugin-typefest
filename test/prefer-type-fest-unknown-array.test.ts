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
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
    ],
});
