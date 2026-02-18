/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-assert-present.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-assert-present");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-assert-present.valid.ts";
const invalidFixtureName = "prefer-ts-extras-assert-present.invalid.ts";

ruleTester.run("prefer-ts-extras-assert-present", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasAssertPresent",
                },
                {
                    messageId: "preferTsExtrasAssertPresent",
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
