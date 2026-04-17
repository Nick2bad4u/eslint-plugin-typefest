/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-non-nullable-deep` behavior.
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

const ruleId = "prefer-type-fest-non-nullable-deep";
const docsDescription =
    "require TypeFest `NonNullableDeep` over `DeepNonNullable` aliases.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-non-nullable-deep";
const preferNonNullableDeepMessage =
    "Prefer `NonNullableDeep` from type-fest over `DeepNonNullable`.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-non-nullable-deep.valid.ts";
const invalidFixtureName = "prefer-type-fest-non-nullable-deep.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);

const inlineInvalidCode = [
    'import type { NonNullableDeep } from "type-fest";',
    "",
    "type DeepNonNullable<T> = { [K in keyof T]: NonNullable<T[K]> };",
    "",
    "interface Config { host: string | null }",
    "",
    "type StrictConfig = DeepNonNullable<Config>;",
].join("\n");

const inlineInvalidOutput = [
    'import type { NonNullableDeep } from "type-fest";',
    "",
    "type DeepNonNullable<T> = { [K in keyof T]: NonNullable<T[K]> };",
    "",
    "interface Config { host: string | null }",
    "",
    "type StrictConfig = NonNullableDeep<Config>;",
].join("\n");

const inlineNoImportInvalidCode = [
    "interface Config { host: string | null }",
    "type StrictConfig = DeepNonNullable<Config>;",
].join("\n");

const inlineNoImportInvalidOutput = [
    'import type { NonNullableDeep } from "type-fest";',
    "interface Config { host: string | null }",
    "type StrictConfig = NonNullableDeep<Config>;",
].join("\n");

const inlineShadowedNonNullableDeepCode = [
    "type Wrapper<NonNullableDeep extends object> = DeepNonNullable<NonNullableDeep>;",
].join("\n");

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferNonNullableDeep: preferNonNullableDeepMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-non-nullable-deep metadata literals", () => {
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

describe("prefer-type-fest-non-nullable-deep parse-safety guards", () => {
    it("fast-check: NonNullableDeep replacement remains parseable across subject types", () => {
        expect.hasAssertions();

        const subjectTypeArbitrary = fc.constantFrom(
            "{ id: string }",
            "{ value: number | null }",
            "{ nested: { key: string | null } | null }"
        );

        fc.assert(
            fc.property(subjectTypeArbitrary, (subjectType) => {
                const code = `type Strict = DeepNonNullable<${subjectType}>;`;
                const fixed = code.replace(
                    "DeepNonNullable<",
                    "NonNullableDeep<"
                );

                expect(fixed).toContain("NonNullableDeep<");

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
            errors: [{ messageId: "preferNonNullableDeep" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture DeepNonNullable alias usage",
            output: `import type { NonNullableDeep } from "type-fest";\n${invalidFixtureCode.replace(
                "DeepNonNullable<Config>",
                "NonNullableDeep<Config>"
            )}`,
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferNonNullableDeep" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports DeepNonNullable and autofixes to NonNullableDeep when import exists",
            output: inlineInvalidOutput,
        },
        {
            code: inlineNoImportInvalidCode,
            errors: [{ messageId: "preferNonNullableDeep" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports DeepNonNullable and inserts NonNullableDeep import when absent",
            output: inlineNoImportInvalidOutput,
        },
        {
            code: inlineShadowedNonNullableDeepCode,
            errors: [{ messageId: "preferNonNullableDeep" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports DeepNonNullable when NonNullableDeep identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns with canonical NonNullableDeep name",
        },
        {
            code: 'import type { NonNullableDeep } from "type-fest"; interface T { x: string | null } type S = NonNullableDeep<T>;',
            filename: typedFixturePath(validFixtureName),
            name: "accepts direct NonNullableDeep<T> type reference",
        },
        {
            code: "type StrictConfig = SomeOtherUtil<Config>;",
            filename: typedFixturePath(validFixtureName),
            name: "accepts unrelated type alias names",
        },
    ],
});
