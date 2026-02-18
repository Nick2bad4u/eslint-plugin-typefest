/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-string-split.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-string-split");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-string-split.valid.ts";
const invalidFixtureName = "prefer-ts-extras-string-split.invalid.ts";

ruleTester.run("prefer-ts-extras-string-split", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasStringSplit",
                },
                {
                    messageId: "preferTsExtrasStringSplit",
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
