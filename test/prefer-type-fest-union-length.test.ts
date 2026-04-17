/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-union-length` behavior.
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

const ruleId = "prefer-type-fest-union-length";
const docsDescription =
    "require TypeFest `UnionLength` over `UnionToTuple<T>['length']`.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-union-length";
const preferUnionLengthMessage =
    "Prefer `UnionLength<T>` from type-fest over `UnionToTuple<T>['length']`.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-union-length.valid.ts";
const invalidFixtureName = "prefer-type-fest-union-length.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);

const inlineInvalidCode = [
    'import type { UnionLength, UnionToTuple } from "type-fest";',
    "",
    "type Colors = 'red' | 'green' | 'blue';",
    "",
    "type ColorCount = UnionToTuple<Colors>['length'];",
].join("\n");

const inlineInvalidOutput = [
    'import type { UnionLength, UnionToTuple } from "type-fest";',
    "",
    "type Colors = 'red' | 'green' | 'blue';",
    "",
    "type ColorCount = UnionLength<Colors>;",
].join("\n");

const inlineNoImportInvalidCode = [
    'import type { UnionToTuple } from "type-fest";',
    "",
    "type Colors = 'red' | 'green' | 'blue';",
    "",
    "type ColorCount = UnionToTuple<Colors>['length'];",
].join("\n");

const inlineNoImportInvalidOutput = [
    'import type { UnionToTuple } from "type-fest";',
    'import type { UnionLength } from "type-fest";',
    "",
    "type Colors = 'red' | 'green' | 'blue';",
    "",
    "type ColorCount = UnionLength<Colors>;",
].join("\n");

const inlineShadowedUnionLengthCode = [
    'import type { UnionToTuple } from "type-fest";',
    "",
    "type Wrapper<UnionLength> = UnionToTuple<UnionLength>['length'];",
].join("\n");

const inlineIndexTypeNotLengthValidCode = [
    'import type { UnionToTuple } from "type-fest";',
    "",
    "type Colors = 'red' | 'green' | 'blue';",
    "",
    "type First = UnionToTuple<Colors>[0];",
].join("\n");

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferUnionLength: preferUnionLengthMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-union-length metadata literals", () => {
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

describe("prefer-type-fest-union-length parse-safety guards", () => {
    it("fast-check: UnionLength replacement remains parseable across union type variants", () => {
        expect.hasAssertions();

        const unionTypeArbitrary = fc.constantFrom(
            "string | number",
            "'a' | 'b' | 'c'",
            "boolean | string | null"
        );

        fc.assert(
            fc.property(unionTypeArbitrary, (unionType) => {
                const code = `type Count = UnionToTuple<${unionType}>['length'];`;
                const fixed = code.replace(
                    `UnionToTuple<${unionType}>['length']`,
                    `UnionLength<${unionType}>`
                );

                expect(fixed).toContain("UnionLength<");
                expect(fixed).not.toContain("['length']");

                expect(() => {
                    parser.parseForESLint(fixed, parserOptions);
                }).not.toThrow();
            }),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [{ messageId: "preferUnionLength" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture UnionToTuple<T>['length'] usage",
            output: invalidFixtureCode
                .replace(
                    'import type { UnionToTuple } from "type-fest";',
                    'import type { UnionToTuple } from "type-fest";\nimport type { UnionLength } from "type-fest";'
                )
                .replace(
                    'UnionToTuple<Colors>["length"]',
                    "UnionLength<Colors>"
                ),
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferUnionLength" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports UnionToTuple<T>['length'] and autofixes to UnionLength<T> when import exists",
            output: inlineInvalidOutput,
        },
        {
            code: inlineNoImportInvalidCode,
            errors: [{ messageId: "preferUnionLength" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports UnionToTuple<T>['length'] and inserts UnionLength import when absent",
            output: inlineNoImportInvalidOutput,
        },
        {
            code: inlineShadowedUnionLengthCode,
            errors: [{ messageId: "preferUnionLength" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports UnionToTuple<T>['length'] when UnionLength identifier is shadowed by type parameter",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns with canonical UnionLength name",
        },
        {
            code: inlineIndexTypeNotLengthValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "accepts UnionToTuple<T>[0] (numeric index, not 'length')",
        },
        {
            code: 'import type { UnionLength } from "type-fest"; type Colors = string | number; type Count = UnionLength<Colors>;',
            filename: typedFixturePath(validFixtureName),
            name: "accepts direct UnionLength<T> type reference",
        },
        {
            code: "type X = SomeType<T>['length'];",
            filename: typedFixturePath(validFixtureName),
            name: "accepts indexed access on non-UnionToTuple type references",
        },
    ],
});
