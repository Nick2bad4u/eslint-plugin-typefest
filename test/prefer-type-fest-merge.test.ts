import parser from "@typescript-eslint/parser";
import { Linter } from "eslint";
import { describe, expect, it } from "vitest";

import typefestPlugin from "../src/plugin";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-merge` behavior.
 */
const ruleId = "prefer-type-fest-merge";
const docsDescription =
    "require TypeFest Merge over Omit/Except<Destination, keyof Source> & Source intersections.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-merge";
const preferMergeMessage =
    "For plain object types, consider replacing the `{{omitTypeName}}<Destination, keyof Source>` and `Source` members with `Merge<Destination, Source>` from type-fest. Keep the other intersection members.";

const ruleTester = createTypedRuleTester();
const rule = getPluginRule(ruleId);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferMerge: preferMergeMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-merge metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect.hasAssertions();
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("coordination between Merge and Except rules", () => {
    it("reports the merge pair once, ignores its shadow, and reports unrelated Omit usage", () => {
        expect.hasAssertions();

        const messages = new Linter().verify(
            [
                "type Combined<A, B, C> = Omit<A, keyof B> & C & B;",
                "namespace Nested {",
                "    type Omit<T, K> = [T, K];",
                "    export type Local<A, B> = Omit<A, keyof B> & B;",
                "}",
                'export type Plain = Omit<{ id: string }, "id">;',
            ].join("\n"),
            {
                files: ["**/*.ts"],
                languageOptions: { parser },
                plugins: { typefest: typefestPlugin },
                rules: {
                    "typefest/prefer-type-fest-except": "error",
                    "typefest/prefer-type-fest-merge": "error",
                },
            },
            { filename: "example.ts" }
        );

        expect(
            messages.map(({ line, ruleId: id }) => [line, id])
        ).toStrictEqual([
            [1, "typefest/prefer-type-fest-merge"],
            [6, "typefest/prefer-type-fest-except"],
        ]);
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: [
                'import type { Except as Omit } from "type-fest";',
                "type Base = { id: string; value: number };",
                "type Source = { value: string };",
                "export type Combined = Omit<Base, keyof Source> & Source;",
            ].join("\n"),
            errors: [
                { data: { omitTypeName: "Omit" }, messageId: "preferMerge" },
            ],
            name: "recognizes the actual Except import even when renamed Omit",
        },
        {
            code: [
                'import type { Except, Merge } from "type-fest";',
                "",
                "type Base = {",
                "    id: string;",
                "    name: string;",
                "};",
                "type Overrides = {",
                "    name: number;",
                "};",
                "",
                "type Combined = Except<Base, keyof Overrides> & Overrides;",
                "type Preferred = Merge<Base, Overrides>;",
            ].join("\n"),
            errors: [{ messageId: "preferMerge" }],
            name: "reports canonical merge-style intersections",
        },
        {
            code: [
                'import type { Except as StrictExcept, Merge } from "type-fest";',
                "",
                "type Base = {",
                "    id: string;",
                "    name: string;",
                "};",
                "type Overrides = {",
                "    name: number;",
                "};",
                "",
                "type Combined = Overrides & StrictExcept<Base, keyof Overrides>;",
                "type Preferred = Merge<Base, Overrides>;",
            ].join("\n"),
            errors: [{ messageId: "preferMerge" }],
            name: "reports reverse-order intersections that still encode merge semantics",
        },
        {
            code: [
                "type Base = {",
                "    id: string;",
                "    name: string;",
                "};",
                "type Overrides = {",
                "    name: number;",
                "    readonly ok: true;",
                "};",
                "",
                "type Combined = Omit<Base, keyof Overrides> & Overrides;",
            ].join("\n"),
            errors: [
                { data: { omitTypeName: "Omit" }, messageId: "preferMerge" },
            ],
            name: "reports builtin Omit merge-style intersections",
        },
        {
            code: [
                "type Base = {",
                "    id: string;",
                "    name: string;",
                "};",
                "type Overrides = {",
                "    name: number;",
                "    readonly ok: true;",
                "};",
                "type Extra = {",
                "    extra: boolean;",
                "};",
                "",
                "type Combined = Omit<Base, keyof Overrides> & Overrides & Extra;",
            ].join("\n"),
            errors: [
                { data: { omitTypeName: "Omit" }, messageId: "preferMerge" },
            ],
            name: "reports merge-style pairs inside larger intersections",
        },
        {
            code: [
                'import type { Except } from "type-fest";',
                "",
                "type Base = {",
                "    id: string;",
                "    name: string;",
                "};",
                "type Overrides = {",
                "    name: number;",
                "};",
                "type Extra = {",
                "    extra: boolean;",
                "};",
                "",
                "type Combined = Except<Base, keyof Overrides> & Extra & Overrides;",
            ].join("\n"),
            errors: [
                { data: { omitTypeName: "Except" }, messageId: "preferMerge" },
            ],
            name: "reports merge-style pairs that are not adjacent",
        },
    ],
    valid: [
        {
            code: "type Combined<B> = Omit<{ x: 1 } | { y: 2 }, keyof B> & B;",
            name: "ignores a union destination whose variants Merge would preserve",
        },
        {
            code: "type Combined<A> = Omit<A, keyof (() => void)> & (() => void);",
            name: "ignores a callable source whose call signature Merge would lose",
        },
        {
            code: "type Combined<B> = Omit<{ [key: string]: string }, keyof B> & B;",
            name: "ignores an operand with an explicit index signature",
        },
        {
            code: [
                "type Omit<T, K> = [T, K];",
                "export type Combined<A, B> = Omit<A, keyof B> & B;",
            ].join("\n"),
            name: "ignores a local Omit type with different semantics",
        },
        {
            code: [
                'import type { Except as E } from "type-fest";',
                "namespace Nested {",
                "    type E<T, K> = [T, K];",
                "    export type Combined<A, B> = E<A, keyof B> & B;",
                "}",
            ].join("\n"),
            name: "ignores a nested type that shadows an imported Except alias",
        },
        {
            code: [
                'import type { Merge } from "type-fest";',
                "",
                "type Base = {",
                "    id: string;",
                "    name: string;",
                "};",
                "type Overrides = {",
                "    name: number;",
                "    readonly ok: true;",
                "};",
                "",
                "type Combined = Merge<Base, Overrides>;",
            ].join("\n"),
            name: "accepts preferred Merge usage",
        },
        {
            code: [
                'import type { Except } from "type-fest";',
                "",
                "type Base = {",
                "    id: string;",
                "    name: string;",
                "};",
                "type Overrides = {",
                "    name: number;",
                "};",
                "",
                "type Combined = Except<Base, keyof Overrides> | Overrides;",
            ].join("\n"),
            name: "ignores non-intersection compositions",
        },
        {
            code: [
                'import type { Except } from "type-fest";',
                "",
                "type Base = {",
                "    id: string;",
                "    name: string;",
                "};",
                "type Overrides = {",
                "    name: number;",
                "};",
                "",
                "type Combined = Except<Base, keyof Overrides> & Readonly<Overrides>;",
            ].join("\n"),
            name: "ignores intersections whose sibling does not match the keyof operand exactly",
        },
        {
            code: [
                "type Base = {",
                "    id: string;",
                "    name: string;",
                "};",
                "type Overrides = {",
                "    name: number;",
                "    readonly ok: true;",
                "};",
                "type Extra = {",
                "    extra: boolean;",
                "};",
                "",
                "type Combined = Omit<Base, keyof Overrides> & Extra;",
                'type WithoutId = Omit<Base, "id"> & Overrides;',
            ].join("\n"),
            name: "ignores Omit intersections without the keyof operand as a member",
        },
    ],
});
