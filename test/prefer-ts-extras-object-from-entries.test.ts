/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-from-entries.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-object-from-entries");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-from-entries.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-from-entries.invalid.ts";
const inlineInvalidCode =
    "const value = Object.fromEntries([['alpha', 1]] as const);";
const computedAccessValidCode =
    "const value = Object['fromEntries']([['alpha', 1]] as const);";
const nonObjectReceiverValidCode = [
    "const helper = {",
    "    fromEntries(entries: ReadonlyArray<readonly [string, number]>): { alpha: number } {",
    "        return { alpha: entries[0][1] };",
    "    },",
    "};",
    "const value = helper.fromEntries([['alpha', 1]] as const);",
].join("\n");
const wrongPropertyValidCode =
    "const value = Object.entries({ alpha: 1 } as const);";
const skipPathInvalidCode = inlineInvalidCode;

ruleTester.run("prefer-ts-extras-object-from-entries", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasObjectFromEntries",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasObjectFromEntries" }],
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
                "prefer-ts-extras-object-from-entries.skip.ts"
            ),
        },
    ],
});
