/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-array-at.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-array-at");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-at.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-at.invalid.ts";

ruleTester.run("prefer-ts-extras-array-at", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasArrayAt",
                },
                {
                    messageId: "preferTsExtrasArrayAt",
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
