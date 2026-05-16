/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-is-null` behavior.
 */
import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-is-null";
const docsDescription =
    "require TypeFest IsNull over manual tuple-wrapped null conditional type guards.";
const message =
    "Prefer `IsNull<T>` from type-fest over manual tuple-wrapped null conditional type guards.";

const invalidCode = "type Result<T> = [T] extends [null] ? true : false;";
const invalidOutput = [
    'import type { IsNull } from "type-fest";',
    "type Result<T> = IsNull<T>;",
].join("\n");
const shadowedInvalidCode =
    "type Result<IsNull, T> = [T] extends [null] ? true : false;";
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;
const generatedParameterNameArbitrary = fc.constantFrom(
    "T",
    "Value",
    "Input",
    "Candidate"
);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferIsNull: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-is-null parse-safety guards", () => {
    it("fast-check: IsNull replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                generatedParameterNameArbitrary,
                fc.boolean(),
                (parameterName, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        `type Result<${parameterName}> = [${parameterName}] extends [null] ? true : false;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { IsNull } from "type-fest";',
                        unicodeLine,
                        `type Result<${parameterName}> = IsNull<${parameterName}>;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    expect(() => {
                        parser.parseForESLint(generatedCode, parserOptions);
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidCode,
            errors: [{ messageId: "preferIsNull" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports tuple-wrapped null conditional guards",
            output: invalidOutput,
        },
        {
            code: shadowedInvalidCode,
            errors: [{ messageId: "preferIsNull" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when IsNull is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { IsNull } from "type-fest"; type Result<T> = IsNull<T>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing IsNull usage",
        },
        {
            code: "type Result<T> = T extends null ? true : false;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores distributive null conditionals",
        },
        {
            code: "type Result<T> = [T] extends [undefined] ? true : false;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores undefined guards",
        },
    ],
});
