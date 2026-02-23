/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-safe-integer.test` behavior.
 */
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-is-safe-integer");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-safe-integer.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-safe-integer.invalid.ts";
const inlineInvalidCode = "const result = Number.isSafeInteger(42);";
const computedAccessValidCode = "const result = Number['isSafeInteger'](42);";
const nonNumberReceiverValidCode = [
    "const helper = {",
    "    isSafeInteger(value: number): boolean {",
    "        return Number.isFinite(value);",
    "    },",
    "};",
    "const result = helper.isSafeInteger(42);",
].join("\n");
const wrongPropertyValidCode = "const result = Number.isInteger(42);";
const skipPathInvalidCode = inlineInvalidCode;
const inlineFixableCode = [
    'import { isSafeInteger } from "ts-extras";',
    "",
    "const result = Number.isSafeInteger(42);",
].join("\n");
const inlineFixableOutput = [
    'import { isSafeInteger } from "ts-extras";',
    "",
    "const result = isSafeInteger(42);",
].join("\n");
const inlineInvalidOutputCode = [
    'import { isSafeInteger } from "ts-extras";',
    "const result = isSafeInteger(42);",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-ts-extras-is-safe-integer",
    {
        defaultOptions: [],
        docsDescription:
            "require ts-extras isSafeInteger over Number.isSafeInteger for consistent predicate helper usage.",
        enforceRuleShape: true,
        messages: {
            preferTsExtrasIsSafeInteger:
                "Prefer `isSafeInteger` from `ts-extras` over `Number.isSafeInteger(...)`.",
        },
        name: "prefer-ts-extras-is-safe-integer",
    }
);

describe("prefer-ts-extras-is-safe-integer source assertions", () => {
    it("keeps is-safe-integer member guard clauses in source", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-ts-extras-is-safe-integer.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain(
            'node.callee.property.type !== "Identifier" ||'
        );
        expect(ruleSource).toContain(
            'node.callee.property.name !== "isSafeInteger"'
        );
    });
});

ruleTester.run("prefer-ts-extras-is-safe-integer", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasIsSafeInteger",
                },
                {
                    messageId: "preferTsExtrasIsSafeInteger",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Number.isSafeInteger calls",
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsSafeInteger" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct Number.isSafeInteger call",
            output: inlineInvalidOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasIsSafeInteger" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Number.isSafeInteger() when isSafeInteger import is in scope",
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
            name: "ignores computed Number.isSafeInteger access",
        },
        {
            code: nonNumberReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom non-Number isSafeInteger method",
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
                "prefer-ts-extras-is-safe-integer.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
