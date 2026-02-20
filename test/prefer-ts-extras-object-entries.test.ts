/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-entries` behavior.
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
const inlineFixableCode = [
    'import { objectEntries } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const entries = Object.entries(sample);",
].join("\n");
const inlineFixableOutput = [
    'import { objectEntries } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const entries = objectEntries(sample);",
].join("\n");
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
                { messageId: "preferTsExtrasObjectEntries" },
                { messageId: "preferTsExtrasObjectEntries" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Object.entries usage",
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasObjectEntries" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct Object.entries call",
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasObjectEntries" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Object.entries when objectEntries import is in scope",
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
            name: "ignores computed Object.entries member access",
        },
        {
            code: nonObjectReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom non-Object entries method",
        },
        {
            code: wrongPropertyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.keys usage",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-ts-extras-object-entries.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
