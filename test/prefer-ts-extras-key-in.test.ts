/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-key-in.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-key-in");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-key-in.valid.ts";
const invalidFixtureName = "prefer-ts-extras-key-in.invalid.ts";

ruleTester.run("prefer-ts-extras-key-in", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
                {
                    messageId: "preferTsExtrasKeyIn",
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
