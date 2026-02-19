/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-entries.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-object-entries");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-entries.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-entries.invalid.ts";
const inlineInvalidCode = "const pairs = Object.entries({ alpha: 1 });";
const computedAccessValidCode =
    "const pairs = Object['entries']({ alpha: 1 });";
const nonObjectReceiverValidCode = [
    "const helper = {",
    "    entries(value: { alpha: number }): readonly [string, number][] {",
    "        return [['alpha', value.alpha]];",
    "    },",
    "};",
    "const pairs = helper.entries({ alpha: 1 });",
].join("\n");
const wrongPropertyValidCode = "const keys = Object.keys({ alpha: 1 });";
const skipPathInvalidCode = inlineInvalidCode;

ruleTester.run("prefer-ts-extras-object-entries", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasObjectEntries",
                },
                {
                    messageId: "preferTsExtrasObjectEntries",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasObjectEntries" }],
            filename: typedFixturePath(invalidFixtureName),
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: computedAccessValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: nonObjectReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: wrongPropertyValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-ts-extras-object-entries.skip.ts"
            ),
        },
    ],
});
