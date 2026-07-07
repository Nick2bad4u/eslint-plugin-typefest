/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-string-length` behavior.
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

const ruleId = "prefer-type-fest-string-length";
const docsDescription =
    "require TypeFest StringLength over StringToArray<T>['length'] string-length extraction.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-string-length";
const message =
    "Prefer `StringLength<T>` from type-fest over `StringToArray<T>['length']`.";
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const ruleTester = createTypedRuleTester();
const rule = getPluginRule(ruleId);
const validFixtureName = "prefer-type-fest-string-length.valid.ts";
const invalidFixtureName = "prefer-type-fest-string-length.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);

const inlineNoImportInvalidCode = [
    'import type { StringToArray } from "type-fest";',
    "",
    'type EventName = "user.created";',
    'type EventNameLength = StringToArray<EventName>["length"];',
].join("\n");

const inlineNoImportInvalidOutput = [
    'import type { StringToArray } from "type-fest";',
    'import type { StringLength } from "type-fest";',
    "",
    'type EventName = "user.created";',
    "type EventNameLength = StringLength<EventName>;",
].join("\n");

const inlineAliasedInvalidCode = [
    'import type { StringLength, StringToArray as Chars } from "type-fest";',
    "",
    'type EventName = "user.created";',
    'type EventNameLength = Chars<EventName>["length"];',
].join("\n");

const inlineAliasedInvalidOutput = [
    'import type { StringLength, StringToArray as Chars } from "type-fest";',
    "",
    'type EventName = "user.created";',
    "type EventNameLength = StringLength<EventName>;",
].join("\n");

const inlineNamespaceInvalidCode = [
    'import type * as TypeFest from "type-fest";',
    'import type { StringLength } from "type-fest";',
    "",
    'type EventName = "user.created";',
    'type EventNameLength = TypeFest.StringToArray<EventName>["length"];',
].join("\n");

const inlineNamespaceInvalidOutput = [
    'import type * as TypeFest from "type-fest";',
    'import type { StringLength } from "type-fest";',
    "",
    'type EventName = "user.created";',
    "type EventNameLength = StringLength<EventName>;",
].join("\n");

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferStringLength: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-string-length metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect.hasAssertions();
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-type-fest-string-length parse-safety guards", () => {
    it("fast-check: StringLength replacement remains parseable across string type variants", () => {
        expect.hasAssertions();

        const stringTypeArbitrary = fc.constantFrom(
            '"abcde"',
            ["`user.", "{string}`"].join("$"),
            "string",
            "Uppercase<string>"
        );

        fc.assert(
            fc.property(stringTypeArbitrary, (stringType) => {
                const code = `type Length = StringToArray<${stringType}>["length"];`;
                const fixed = code.replace(
                    `StringToArray<${stringType}>["length"]`,
                    `StringLength<${stringType}>`
                );

                expect(fixed).toContain("StringLength<");
                expect(fixed).not.toContain('["length"]');

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
            errors: [{ messageId: "preferStringLength" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture StringToArray<T> length extraction",
            output: invalidFixtureCode
                .replace(
                    'import type { StringToArray } from "type-fest";',
                    'import type { StringToArray } from "type-fest";\nimport type { StringLength } from "type-fest";'
                )
                .replace(
                    'StringToArray<EventName>["length"]',
                    "StringLength<EventName>"
                ),
        },
        {
            code: inlineNoImportInvalidCode,
            errors: [{ messageId: "preferStringLength" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports StringToArray<T> length extraction and inserts StringLength import",
            output: inlineNoImportInvalidOutput,
        },
        {
            code: inlineAliasedInvalidCode,
            errors: [{ messageId: "preferStringLength" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports aliased StringToArray<T> length extraction",
            output: inlineAliasedInvalidOutput,
        },
        {
            code: inlineNamespaceInvalidCode,
            errors: [{ messageId: "preferStringLength" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports namespace-qualified StringToArray<T> length extraction",
            output: inlineNamespaceInvalidOutput,
        },
        {
            code: [
                'import type { StringToArray } from "type-fest";',
                "",
                'type Wrapper<StringLength> = StringToArray<"abc">["length"];',
            ].join("\n"),
            errors: [{ messageId: "preferStringLength" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports without autofix when StringLength is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe StringLength and StringToArray option patterns",
        },
        {
            code: 'import type { StringLength } from "type-fest"; type Length = StringLength<"abc">;',
            filename: typedFixturePath(validFixtureName),
            name: "accepts existing StringLength usage",
        },
        {
            code: 'import type { StringToArray } from "type-fest"; type First = StringToArray<"abc">[0];',
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-length StringToArray indexed access",
        },
        {
            code: 'import type { StringToArray } from "type-fest"; type Length = StringToArray<string, { mapNonLiteralsDirectly: true }>["length"];',
            filename: typedFixturePath(validFixtureName),
            name: "ignores option-sensitive StringToArray<T, Options> length extraction",
        },
        {
            code: 'type Local = StringToArray<"abc">["length"];',
            filename: typedFixturePath(validFixtureName),
            name: "ignores local StringToArray types not imported from type-fest",
        },
        {
            code: 'import type { StringToArray } from "type-fest"; type Wrapper<StringToArray> = StringToArray<"abc">["length"];',
            filename: typedFixturePath(validFixtureName),
            name: "ignores type-parameter shadowed StringToArray references",
        },
        {
            code: 'import type * as TypeFest from "type-fest"; type Wrapper<TypeFest> = TypeFest.StringToArray<"abc">["length"];',
            filename: typedFixturePath(validFixtureName),
            name: "ignores type-parameter shadowed namespace references",
        },
    ],
});
