/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-array-find-last.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-array-find-last");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-array-find-last.valid.ts";
const invalidFixtureName = "prefer-ts-extras-array-find-last.invalid.ts";

ruleTester.run("prefer-ts-extras-array-find-last", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasArrayFindLast",
                },
                {
                    messageId: "preferTsExtrasArrayFindLast",
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
