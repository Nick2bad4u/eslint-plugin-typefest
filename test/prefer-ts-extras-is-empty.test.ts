import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-is-empty");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-empty.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-empty.invalid.ts";

ruleTester.run("prefer-ts-extras-is-empty", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasIsEmpty",
                },
                {
                    messageId: "preferTsExtrasIsEmpty",
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
