import parser from "@typescript-eslint/parser";
import { Linter } from "eslint";
import { describe, expect, it } from "vitest";

import typefestPlugin from "../src/plugin";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";
import {
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-thunkable";
const fixture = "prefer-type-fest-thunkable.ts";
const filename = typedFixturePath("upstream-latest", fixture);

describe("workspace resolution for Thunkable", () => {
    it("uses the type-fest version nearest each linted file", () => {
        expect.hasAssertions();

        const code = readTypedFixture("upstream-latest", fixture);
        const linter = new Linter();
        const config = {
            files: ["**/*.ts"],
            languageOptions: { parser },
            plugins: { typefest: typefestPlugin },
            rules: { "typefest/prefer-type-fest-thunkable": "error" },
        } as const satisfies Linter.Config;
        const current = linter.verify(code, config, { filename });
        const legacy = linter.verify(code, config, {
            filename: typedFixturePath("prefer-ts-extras-array-at.valid.ts"),
        });

        expect(current.map(({ messageId }) => messageId)).toStrictEqual([
            "preferThunkable",
            "preferThunkable",
        ]);
        expect(legacy).toHaveLength(0);
    });
});

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription:
        "require TypeFest Thunkable over generic value-or-thunk aliases.",
    messages: {
        preferThunkable:
            "Use `Thunkable<{{parameter}}>` from type-fest for a value or a zero-argument function returning that value.",
    },
    name: ruleId,
});

createRuleTester().run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: readTypedFixture("upstream-latest", fixture),
            errors: [
                {
                    data: { parameter: "Value" },
                    messageId: "preferThunkable",
                    suggestions: [],
                },
                {
                    data: { parameter: "T" },
                    messageId: "preferThunkable",
                    suggestions: [],
                },
            ],
            filename,
            name: "reports both union orders and preserves alias constraints and defaults",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { Thunkable } from "type-fest"; type Lazy<T> = Thunkable<T>;',
            filename,
            name: "accepts the upstream helper",
        },
        {
            code: [
                "type Concrete = string | (() => string);",
                "type Multiple<A, B> = A | (() => B);",
                "type Other = number;",
                "type WrongReturn<T> = T | (() => Other);",
                "type WrongValue<T> = Other | (() => T);",
                "type Nested<T> = { input: T | (() => T) };",
                "type Extra<T> = T | (() => T) | undefined;",
            ].join("\n"),
            filename,
            name: "ignores concrete, nested, wider and differently bound unions",
        },
        {
            code: [
                "type Required<T> = T | ((input: string) => T);",
                "type Optional<T> = T | ((input?: string) => T);",
                "type Rest<T> = T | ((...args: []) => T);",
                "type WithThis<T> = T | ((this: object) => T);",
                "type Shadowed<T> = T | (<T>() => T);",
                "type Generic<T> = T | (<U>() => T);",
                "type Constructor<T> = T | (new () => T);",
                "type Predicate<T> = T | ((value: unknown) => value is T);",
            ].join("\n"),
            filename,
            name: "ignores callbacks with parameters, this, generics, or other signatures",
        },
    ],
});
