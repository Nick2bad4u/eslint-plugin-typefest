import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-object-has-in");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-has-in.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-has-in.invalid.ts";

ruleTester.run("prefer-ts-extras-object-has-in", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasObjectHasIn",
                },
                {
                    messageId: "preferTsExtrasObjectHasIn",
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
