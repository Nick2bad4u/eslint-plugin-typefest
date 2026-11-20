/**
 * @packageDocumentation
 * Tests for the `prefer-ts-extras-is-truthy` rule.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-is-truthy";
const validFixture = "prefer-ts-extras-is-truthy.valid.ts";
const invalidFixture = "prefer-ts-extras-is-truthy.invalid.ts";

createTypedRuleTester().run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: readTypedFixture("upstream-latest", invalidFixture),
            errors: [
                { messageId: "preferTsExtrasIsTruthy" },
                { messageId: "preferTsExtrasIsTruthy" },
                { messageId: "preferTsExtrasIsTruthy" },
                { messageId: "preferTsExtrasIsTruthy" },
                { messageId: "preferTsExtrasIsTruthy" },
            ],
            filename: typedFixturePath("upstream-latest", invalidFixture),
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture("upstream-latest", validFixture),
            filename: typedFixturePath("upstream-latest", validFixture),
        },
    ],
});
