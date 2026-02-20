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
const inlineFixableCode = [
    'import { isFinite } from "ts-extras";',
    "",
    "const result = Number.isFinite(42);",
].join("\n");
const inlineFixableOutput = [
    'import { isFinite } from "ts-extras";',
    "",
    "const result = isFinite(42);",
].join("\n");

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
            name: "reports fixture Number.isFinite calls",
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsFinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct Number.isFinite call",
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasIsFinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Number.isFinite() when isFinite import is in scope",
            output: inlineFixableOutput,
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
            name: "ignores computed Number.isFinite access",
        },
        {
            code: nonNumberReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom non-Number isFinite method",
        },
        {
            code: wrongPropertyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Number.isInteger call",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-ts-extras-is-finite.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
