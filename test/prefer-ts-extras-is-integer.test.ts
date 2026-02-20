/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-integer.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-is-integer");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-integer.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-integer.invalid.ts";
const inlineInvalidCode = "const result = Number.isInteger(42);";
const computedAccessValidCode = "const result = Number['isInteger'](42);";
const nonNumberReceiverValidCode = [
    "const helper = {",
    "    isInteger(value: number): boolean {",
    "        return Number.isFinite(value);",
    "    },",
    "};",
    "const result = helper.isInteger(42);",
].join("\n");
const wrongPropertyValidCode = "const result = Number.isFinite(42);";
const skipPathInvalidCode = inlineInvalidCode;

ruleTester.run("prefer-ts-extras-is-integer", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasIsInteger",
                },
                {
                    messageId: "preferTsExtrasIsInteger",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Number.isInteger calls",
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsInteger" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct Number.isInteger call",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: computedAccessValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores computed Number.isInteger access",
        },
        {
            code: nonNumberReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom non-Number isInteger method",
        },
        {
            code: wrongPropertyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Number.isFinite call",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-ts-extras-is-integer.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
