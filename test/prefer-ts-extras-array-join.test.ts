import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-array-join");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-join.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-join.invalid.ts";

ruleTester.run("prefer-ts-extras-array-join", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasArrayJoin",
                },
                {
                    messageId: "preferTsExtrasArrayJoin",
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
