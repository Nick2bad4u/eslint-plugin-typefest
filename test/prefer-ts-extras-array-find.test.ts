import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-array-find");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-find.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-find.invalid.ts";

ruleTester.run("prefer-ts-extras-array-find", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasArrayFind",
                },
                {
                    messageId: "preferTsExtrasArrayFind",
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
