import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-object-keys");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-keys.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-keys.invalid.ts";

ruleTester.run("prefer-ts-extras-object-keys", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasObjectKeys",
                },
                {
                    messageId: "preferTsExtrasObjectKeys",
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
