import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";
import {
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";
import { verifyUpstreamRule } from "./_internal/upstream-fix-output";

const ruleId = "prefer-type-fest-required-non-nullable";
const fixture = "prefer-type-fest-required-non-nullable.ts";
const filename = typedFixturePath("upstream-latest", fixture);

describe("mapped property bindings", () => {
    it("reports through a value-only NonNullable binding and respects a local type binding", () => {
        expect.hasAssertions();

        const code = [
            "export const NonNullable = Symbol();",
            "type Local<T> = { [P in keyof T]-?: NonNullable<T[P]> };",
            "namespace Custom { type NonNullable<V> = V; export type Local<T> = { [P in keyof T]-?: NonNullable<T[P]> }; }",
        ].join("\n");
        const result = verifyUpstreamRule(ruleId, code, filename);

        expect(
            result.messages.map(({ line, messageId }) => [line, messageId])
        ).toStrictEqual([[2, "preferRequiredNonNullable"]]);
        expect(result.fixed).toBe(false);
        expect(result.output).toBe(code);
    });
});

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription:
        "require TypeFest RequiredNonNullable over a required mapped type that removes nullable property values.",
    messages: {
        preferRequiredNonNullable:
            "Use `RequiredNonNullable` from type-fest to require every property and remove null and undefined from its value.",
    },
    name: ruleId,
});

createRuleTester().run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: readTypedFixture("upstream-latest", fixture),
            errors: [
                { messageId: "preferRequiredNonNullable", suggestions: [] },
                { messageId: "preferRequiredNonNullable", suggestions: [] },
            ],
            filename,
            name: "reports required non-nullable properties on unconstrained and constrained aliases",
            output: null,
        },
    ],
    valid: [
        {
            code: [
                'import type { RequiredNonNullable } from "type-fest";',
                "type Present<T> = RequiredNonNullable<T>;",
            ].join("\n"),
            filename,
            name: "accepts the upstream helper",
        },
        {
            code: [
                "type Optional<T> = { [P in keyof T]?: NonNullable<T[P]> };",
                "type SameOptional<T> = { [P in keyof T]: NonNullable<T[P]> };",
                "type Mutable<T> = { -readonly [P in keyof T]-?: NonNullable<T[P]> };",
                "type Immutable<T> = { readonly [P in keyof T]-?: NonNullable<T[P]> };",
                "type Remapped<T> = { [P in keyof T as Extract<P, string>]-?: NonNullable<T[P]> };",
                "type Nested<T> = { [P in keyof T]-?: Array<NonNullable<T[P]>> };",
                "type KeepNull<T> = { [P in keyof T]-?: T[P] };",
            ].join("\n"),
            filename,
            name: "preserves optional, readonly, filtered, and transformed properties",
        },
        {
            code: [
                "type Other = { value: string };",
                "type OtherKeys<T extends Other> = { [P in keyof Other]-?: NonNullable<T[P]> };",
                "type OtherInput<T extends Other> = { [P in keyof T]-?: NonNullable<Other[keyof Other]> };",
                "type OtherIndex<T> = { [P in keyof T]-?: NonNullable<T[keyof T]> };",
                "type ShadowedKey<T> = { [T in keyof T]-?: NonNullable<T[T]> };",
                "namespace Local { type NonNullable<X> = X; export type Present<T> = { [P in keyof T]-?: NonNullable<T[P]> }; }",
            ].join("\n"),
            filename,
            name: "requires the same input, mapped key and builtin NonNullable",
        },
    ],
});
