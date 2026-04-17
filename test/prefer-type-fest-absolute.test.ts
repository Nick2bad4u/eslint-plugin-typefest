/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-absolute` behavior.
 */
import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-absolute";
const docsDescription =
    "require TypeFest `Absolute` over common `Abs` or `AbsoluteValue` aliases.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-absolute";
const preferAbsoluteMessage =
    "Prefer `Absolute` from type-fest over `{{aliasName}}`.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-absolute.valid.ts";
const invalidFixtureName = "prefer-type-fest-absolute.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);

const inlineAbsInvalidCode = [
    'import type { Absolute } from "type-fest";',
    "",
    "type Abs<N extends number> = N;",
    "",
    "type Result = Abs<-5>;",
].join("\n");

const inlineAbsInvalidOutput = [
    'import type { Absolute } from "type-fest";',
    "",
    "type Abs<N extends number> = N;",
    "",
    "type Result = Absolute<-5>;",
].join("\n");

const inlineAbsoluteValueInvalidCode = [
    'import type { Absolute } from "type-fest";',
    "",
    "type AbsoluteValue<N extends number> = N;",
    "",
    "type Result = AbsoluteValue<-3>;",
].join("\n");

const inlineAbsoluteValueInvalidOutput = [
    'import type { Absolute } from "type-fest";',
    "",
    "type AbsoluteValue<N extends number> = N;",
    "",
    "type Result = Absolute<-3>;",
].join("\n");

const inlineNoImportInvalidCode = ["type Result = Abs<-5>;"].join("\n");

const inlineNoImportInvalidOutput = [
    'import type { Absolute } from "type-fest";',
    "type Result = Absolute<-5>;",
].join("\n");

const inlineShadowedAbsoluteCode = [
    "type Wrapper<Absolute extends number> = Abs<Absolute>;",
].join("\n");

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferAbsolute: preferAbsoluteMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-absolute metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect.hasAssertions();
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

describe("prefer-type-fest-absolute parse-safety guards", () => {
    it("fast-check: Absolute replacement remains parseable across alias name variants", () => {
        expect.hasAssertions();

        const aliasNameArbitrary = fc.constantFrom("Abs", "AbsoluteValue");
        const numericArgArbitrary = fc.constantFrom("-1", "-100", "0");

        fc.assert(
            fc.property(
                aliasNameArbitrary,
                numericArgArbitrary,
                (aliasName, numericArg) => {
                    const code = `type Result = ${aliasName}<${numericArg}>;`;

                    // After fix, the identifier should be "Absolute"
                    const fixed = code.replace(`${aliasName}<`, "Absolute<");

                    expect(fixed).toContain("Absolute<");

                    expect(() => {
                        parser.parseForESLint(fixed, parserOptions);
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                { messageId: "preferAbsolute" },
                { messageId: "preferAbsolute" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Abs and AbsoluteValue alias usage",
            // Two passes: pass 1 inserts import + fixes Abs<-5>;
            // pass 2 fixes AbsoluteValue<-3> (import already present).
            output: [
                `import type { Absolute } from "type-fest";\n${invalidFixtureCode.replace(
                    "Abs<-5>",
                    "Absolute<-5>"
                )}`,
                `import type { Absolute } from "type-fest";\n${invalidFixtureCode
                    .replace("Abs<-5>", "Absolute<-5>")
                    .replace("AbsoluteValue<-3>", "Absolute<-3>")}`,
            ],
        },
        {
            code: inlineAbsInvalidCode,
            errors: [{ messageId: "preferAbsolute" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Abs<N> alias and autofixes to Absolute<N> when import exists",
            output: inlineAbsInvalidOutput,
        },
        {
            code: inlineAbsoluteValueInvalidCode,
            errors: [{ messageId: "preferAbsolute" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports AbsoluteValue<N> alias and autofixes to Absolute<N> when import exists",
            output: inlineAbsoluteValueInvalidOutput,
        },
        {
            code: inlineNoImportInvalidCode,
            errors: [{ messageId: "preferAbsolute" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Abs<N> alias and inserts Absolute import when absent",
            output: inlineNoImportInvalidOutput,
        },
        {
            code: inlineShadowedAbsoluteCode,
            errors: [{ messageId: "preferAbsolute" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Abs alias when Absolute identifier is shadowed by type parameter",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns with canonical Absolute name",
        },
        {
            code: 'import type { Absolute } from "type-fest"; type Result = Absolute<-5>;',
            filename: typedFixturePath(validFixtureName),
            name: "accepts direct Absolute<N> type reference",
        },
        {
            code: "type Result = SomeOtherAlias<-5>;",
            filename: typedFixturePath(validFixtureName),
            name: "accepts unrelated type alias names",
        },
    ],
});
