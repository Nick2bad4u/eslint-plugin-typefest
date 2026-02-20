/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-keys.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-object-keys");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-keys.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-keys.invalid.ts";
const inlineInvalidCode = "const keys = Object.keys({ alpha: 1 });";
const computedAccessValidCode = "const keys = Object['keys']({ alpha: 1 });";
const nonObjectReceiverValidCode = [
    "const helper = {",
    "    keys(value: { alpha: number }): readonly string[] {",
    "        return ['alpha'];",
    "    },",
    "};",
    "const keys = helper.keys({ alpha: 1 });",
].join("\n");
const wrongPropertyValidCode = "const values = Object.values({ alpha: 1 });";
const skipPathInvalidCode = inlineInvalidCode;

ruleTester.run("prefer-ts-extras-object-keys", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasObjectKeys",
                },
                {
                    messageId: "preferTsExtrasObjectKeys",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Object.keys usage",
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasObjectKeys" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct Object.keys call",
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
            name: "ignores computed Object.keys member access",
        },
        {
            code: nonObjectReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom non-Object keys method",
        },
        {
            code: wrongPropertyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.values usage",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-ts-extras-object-keys.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
