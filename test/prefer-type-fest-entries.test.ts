/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-entries` behavior.
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
const ruleId = "prefer-type-fest-entries";
const docsDescription =
    "require TypeFest Entries over manual arrays of `[keyof T, T[keyof T]]` object entry tuple types.";
const message =
    "Prefer `Entries<T>` from type-fest over manual arrays of `[keyof T, T[keyof T]]` object entry tuple types.";

const arrayReferenceInvalidCode =
    "type Pairs<T> = Array<[keyof T, T[keyof T]]>;";
const arrayReferenceInvalidOutput = [
    'import type { Entries } from "type-fest";',
    "type Pairs<T> = Entries<T>;",
].join("\n");
const arrayShorthandInvalidCode = "type Pairs<T> = [keyof T, T[keyof T]][];";
const arrayShorthandInvalidOutput = [
    'import type { Entries } from "type-fest";',
    "type Pairs<T> = Entries<T>;",
].join("\n");
const shadowedInvalidCode =
    "type Pairs<Entries, T> = Array<[keyof T, T[keyof T]]>;";
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
const entriesWrapperArbitrary = fc.constantFrom<"array" | "genericArray">(
    "array",
    "genericArray"
);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferEntries: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-entries parse-safety guards", () => {
    it("fast-check: Entries replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                generatedParameterNameArbitrary,
                entriesWrapperArbitrary,
                fc.boolean(),
                (parameterName, wrapper, includeUnicodeLine) => {
                    const entryTupleText = `[keyof ${parameterName}, ${parameterName}[keyof ${parameterName}]]`;
                    const entryCollectionText =
                        wrapper === "array"
                            ? `${entryTupleText}[]`
                            : `Array<${entryTupleText}>`;
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        `type Pairs<${parameterName}> = ${entryCollectionText};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { Entries } from "type-fest";',
                        unicodeLine,
                        `type Pairs<${parameterName}> = Entries<${parameterName}>;`,
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
            code: arrayReferenceInvalidCode,
            errors: [{ messageId: "preferEntries" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports Array wrapped manual object entry tuple arrays",
            output: arrayReferenceInvalidOutput,
        },
        {
            code: arrayShorthandInvalidCode,
            errors: [{ messageId: "preferEntries" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports array shorthand wrapped manual object entry tuple arrays",
            output: arrayShorthandInvalidOutput,
        },
        {
            code: shadowedInvalidCode,
            errors: [{ messageId: "preferEntries" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when Entries is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { Entries } from "type-fest"; type Pairs<T> = Entries<T>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing Entries usage",
        },
        {
            code: "type Pair<T> = [keyof T, T[keyof T]];",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores single entry tuple aliases",
        },
        {
            code: "type Pairs<T> = ReadonlyArray<[keyof T, T[keyof T]]>;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores readonly array wrappers until readonly semantics are modeled explicitly",
        },
        {
            code: "type Pairs<T> = Array<[keyof T, T[string]]>;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores entry arrays whose value key does not match keyof target",
        },
    ],
});
