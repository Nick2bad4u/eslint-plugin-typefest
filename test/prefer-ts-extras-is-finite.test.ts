import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-is-finite");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-finite.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-finite.invalid.ts";

ruleTester.run("prefer-ts-extras-is-finite", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasIsFinite",
                },
                {
                    messageId: "preferTsExtrasIsFinite",
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
