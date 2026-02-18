/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-safe-integer.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-is-safe-integer");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-safe-integer.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-safe-integer.invalid.ts";

ruleTester.run("prefer-ts-extras-is-safe-integer", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasIsSafeInteger",
                },
                {
                    messageId: "preferTsExtrasIsSafeInteger",
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
