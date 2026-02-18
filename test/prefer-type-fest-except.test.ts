/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-except.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-except");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-except.valid.ts";
const invalidFixtureName = "prefer-type-fest-except.invalid.ts";

ruleTester.run("prefer-type-fest-except", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferExcept",
                },
                {
                    messageId: "preferExcept",
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
