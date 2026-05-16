/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-is-tuple` behavior.
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
const ruleId = "prefer-type-fest-is-tuple";
const docsDescription =
    "require TypeFest IsTuple over manual length-based tuple conditional type guards.";
const message =
    "Prefer `IsTuple<T>` from type-fest over manual length-based tuple conditional type guards.";

const invalidCode =
    'type Result<T extends readonly unknown[]> = number extends T["length"] ? false : true;';
const invalidOutput = [
    'import type { IsTuple } from "type-fest";',
    "type Result<T extends readonly unknown[]> = IsTuple<T>;",
].join("\n");
const shadowedInvalidCode =
    'type Result<IsTuple, T extends readonly unknown[]> = number extends T["length"] ? false : true;';
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
        preferIsTuple: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-is-tuple parse-safety guards", () => {
    it("fast-check: IsTuple replacement remains parseable", () => {
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
                        `type Result<${parameterName} extends readonly unknown[]> = number extends ${parameterName}["length"] ? false : true;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { IsTuple } from "type-fest";',
                        unicodeLine,
                        `type Result<${parameterName} extends readonly unknown[]> = IsTuple<${parameterName}>;`,
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
            errors: [{ messageId: "preferIsTuple" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports length-based tuple conditional guards",
            output: invalidOutput,
        },
        {
            code: shadowedInvalidCode,
            errors: [{ messageId: "preferIsTuple" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when IsTuple is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { IsTuple } from "type-fest"; type Result<T extends readonly unknown[]> = IsTuple<T>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing IsTuple usage",
        },
        {
            code: 'type Result<T extends readonly unknown[]> = number extends T["length"] ? true : false;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores array guards with opposite branches",
        },
        {
            code: 'type Result<T extends readonly unknown[]> = number extends T["size"] ? false : true;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores non-length indexed access checks",
        },
    ],
});
