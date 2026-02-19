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
const inlineInvalidCode = "const values = Object.values({ alpha: 1 });";
const computedAccessValidCode =
    "const values = Object['values']({ alpha: 1 });";
const nonObjectReceiverValidCode = [
    "const helper = {",
    "    values(value: { alpha: number }): readonly number[] {",
    "        return [value.alpha];",
    "    },",
    "};",
    "const values = helper.values({ alpha: 1 });",
].join("\n");
const wrongPropertyValidCode = "const keys = Object.keys({ alpha: 1 });";
const skipPathInvalidCode = inlineInvalidCode;

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
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasObjectValues" }],
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
                "prefer-ts-extras-object-values.skip.ts"
            ),
        },
    ],
});
