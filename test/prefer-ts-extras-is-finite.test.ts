/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-finite.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-is-finite");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-finite.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-finite.invalid.ts";
const inlineInvalidCode = "const result = Number.isFinite(42);";
const computedAccessValidCode = "const result = Number['isFinite'](42);";
const nonNumberReceiverValidCode = [
    "const helper = {",
    "    isFinite(value: number): boolean {",
    "        return value > 0;",
    "    },",
    "};",
    "const result = helper.isFinite(42);",
].join("\n");
const wrongPropertyValidCode = "const result = Number.isInteger(42);";
const skipPathInvalidCode = inlineInvalidCode;

ruleTester.run("prefer-ts-extras-is-finite", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasIsFinite",
                },
                {
                    messageId: "preferTsExtrasIsFinite",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsFinite" }],
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
            code: nonNumberReceiverValidCode,
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
                "prefer-ts-extras-is-finite.skip.ts"
            ),
        },
    ],
});
