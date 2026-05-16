/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-is-never` behavior.
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
const ruleId = "prefer-type-fest-is-never";
const docsDescription =
    "require TypeFest IsNever over manual tuple-wrapped never conditional type guards.";
const message =
    "Prefer `IsNever<T>` from type-fest over manual tuple-wrapped never conditional type guards.";

const invalidCode = "type Result<T> = [T] extends [never] ? true : false;";
const invalidOutput = [
    'import type { IsNever } from "type-fest";',
    "type Result<T> = IsNever<T>;",
].join("\n");
const shadowedInvalidCode =
    "type Result<IsNever, T> = [T] extends [never] ? true : false;";
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
        preferIsNever: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-is-never parse-safety guards", () => {
    it("fast-check: IsNever replacement remains parseable", () => {
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
                        `type Result<${parameterName}> = [${parameterName}] extends [never] ? true : false;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { IsNever } from "type-fest";',
                        unicodeLine,
                        `type Result<${parameterName}> = IsNever<${parameterName}>;`,
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
            errors: [{ messageId: "preferIsNever" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports tuple-wrapped never conditional guards",
            output: invalidOutput,
        },
        {
            code: shadowedInvalidCode,
            errors: [{ messageId: "preferIsNever" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when IsNever is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { IsNever } from "type-fest"; type Result<T> = IsNever<T>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing IsNever usage",
        },
        {
            code: "type Result<T> = T extends never ? true : false;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores distributive never conditionals",
        },
        {
            code: "type Result<T> = [T] extends [never] ? false : true;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores inverted boolean branches",
        },
    ],
});
