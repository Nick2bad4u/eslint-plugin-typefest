/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unknown-map.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-unknown-map");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-unknown-map.valid.ts";
const invalidFixtureName = "prefer-type-fest-unknown-map.invalid.ts";

ruleTester.run("prefer-type-fest-unknown-map", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferUnknownMap",
                },
                {
                    messageId: "preferUnknownMap",
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
