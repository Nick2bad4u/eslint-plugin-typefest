/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-values.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-object-values");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-values.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-values.invalid.ts";

ruleTester.run("prefer-ts-extras-object-values", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasObjectValues",
                },
                {
                    messageId: "preferTsExtrasObjectValues",
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
