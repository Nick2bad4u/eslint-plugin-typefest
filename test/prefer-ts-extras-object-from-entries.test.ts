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
const inlineFixableCode = [
    'import { objectFromEntries } from "ts-extras";',
    "",
    "const entries = [['alpha', 1]] as const;",
    "const value = Object.fromEntries(entries);",
].join("\n");
const inlineFixableOutput = [
    'import { objectFromEntries } from "ts-extras";',
    "",
    "const entries = [['alpha', 1]] as const;",
    "const value = objectFromEntries(entries);",
].join("\n");
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
            name: "reports fixture Object.fromEntries usage",
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasObjectFromEntries" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct Object.fromEntries call",
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasObjectFromEntries" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Object.fromEntries when objectFromEntries import is in scope",
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
            name: "ignores computed Object.fromEntries member access",
        },
        {
            code: nonObjectReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom non-Object fromEntries method",
        },
        {
            code: wrongPropertyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.entries usage",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-ts-extras-object-from-entries.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
