/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-entry` behavior.
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
const ruleId = "prefer-type-fest-entry";
const docsDescription =
    "require TypeFest Entry over manual `[keyof T, T[keyof T]]` object entry tuple types.";
const message =
    "Prefer `Entry<T>` from type-fest over manual `[keyof T, T[keyof T]]` object entry tuple types.";

const invalidCode = "type Pair<T> = [keyof T, T[keyof T]];";
const invalidOutput = [
    'import type { Entry } from "type-fest";',
    "type Pair<T> = Entry<T>;",
].join("\n");
const shadowedInvalidCode = "type Pair<Entry, T> = [keyof T, T[keyof T]];";
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
        preferEntry: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-entry parse-safety guards", () => {
    it("fast-check: Entry replacement remains parseable", () => {
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
                        `type Pair<${parameterName}> = [keyof ${parameterName}, ${parameterName}[keyof ${parameterName}]];`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { Entry } from "type-fest";',
                        unicodeLine,
                        `type Pair<${parameterName}> = Entry<${parameterName}>;`,
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
            errors: [{ messageId: "preferEntry" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports manual object entry tuple types",
            output: invalidOutput,
        },
        {
            code: shadowedInvalidCode,
            errors: [{ messageId: "preferEntry" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when Entry is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { Entry } from "type-fest"; type Pair<T> = Entry<T>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing Entry usage",
        },
        {
            code: "type Pair<T> = Array<[keyof T, T[keyof T]]>;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "defers array wrappers to prefer-type-fest-entries",
        },
        {
            code: "type Pair<T> = [keyof T, T[string]];",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores tuple pairs whose value key does not match keyof target",
        },
        {
            code: "type Pair<T, U> = [keyof T, U[keyof T]];",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores tuple pairs whose value object does not match key target",
        },
    ],
});
