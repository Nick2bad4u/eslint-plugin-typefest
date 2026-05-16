/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-is-unknown` behavior.
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
const ruleId = "prefer-type-fest-is-unknown";
const docsDescription =
    "require TypeFest IsUnknown over manual unknown conditional type guards.";
const message =
    "Prefer `IsUnknown<T>` from type-fest over manual unknown conditional type guards.";

const invalidCode =
    "type Result<T> = unknown extends T ? [T] extends [null] ? false : true : false;";
const invalidOutput = [
    'import type { IsUnknown } from "type-fest";',
    "type Result<T> = IsUnknown<T>;",
].join("\n");
const shadowedInvalidCode =
    "type Result<IsUnknown, T> = unknown extends T ? [T] extends [null] ? false : true : false;";
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
        preferIsUnknown: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-is-unknown parse-safety guards", () => {
    it("fast-check: IsUnknown replacement remains parseable", () => {
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
                        `type Result<${parameterName}> = unknown extends ${parameterName} ? [${parameterName}] extends [null] ? false : true : false;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { IsUnknown } from "type-fest";',
                        unicodeLine,
                        `type Result<${parameterName}> = IsUnknown<${parameterName}>;`,
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
            errors: [{ messageId: "preferIsUnknown" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports manual unknown conditional guards",
            output: invalidOutput,
        },
        {
            code: shadowedInvalidCode,
            errors: [{ messageId: "preferIsUnknown" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when IsUnknown is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { IsUnknown } from "type-fest"; type Result<T> = IsUnknown<T>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing IsUnknown usage",
        },
        {
            code: "type Result<T> = unknown extends T ? true : false;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores simpler unknown conditionals without null exclusion",
        },
        {
            code: "type Result<T> = unknown extends T ? [T] extends [undefined] ? false : true : false;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores non-null exclusions",
        },
    ],
});
