/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-is-undefined` behavior.
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
const ruleId = "prefer-type-fest-is-undefined";
const docsDescription =
    "require TypeFest IsUndefined over manual tuple-wrapped undefined conditional type guards.";
const message =
    "Prefer `IsUndefined<T>` from type-fest over manual tuple-wrapped undefined conditional type guards.";

const invalidCode = "type Result<T> = [T] extends [undefined] ? true : false;";
const invalidOutput = [
    'import type { IsUndefined } from "type-fest";',
    "type Result<T> = IsUndefined<T>;",
].join("\n");
const shadowedInvalidCode =
    "type Result<IsUndefined, T> = [T] extends [undefined] ? true : false;";
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
        preferIsUndefined: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-is-undefined parse-safety guards", () => {
    it("fast-check: IsUndefined replacement remains parseable", () => {
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
                        `type Result<${parameterName}> = [${parameterName}] extends [undefined] ? true : false;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { IsUndefined } from "type-fest";',
                        unicodeLine,
                        `type Result<${parameterName}> = IsUndefined<${parameterName}>;`,
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
            errors: [{ messageId: "preferIsUndefined" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports tuple-wrapped undefined conditional guards",
            output: invalidOutput,
        },
        {
            code: shadowedInvalidCode,
            errors: [{ messageId: "preferIsUndefined" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when IsUndefined is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { IsUndefined } from "type-fest"; type Result<T> = IsUndefined<T>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing IsUndefined usage",
        },
        {
            code: "type Result<T> = T extends undefined ? true : false;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores distributive undefined conditionals",
        },
        {
            code: "type Result<T> = [T] extends [null] ? true : false;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores null guards",
        },
    ],
});
