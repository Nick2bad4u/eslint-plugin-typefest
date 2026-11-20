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

const ruleId = "prefer-type-fest-empty-array";
const fixture = "prefer-type-fest-empty-array.ts";
const filename = typedFixturePath("upstream-latest", fixture);

describe("same-name EmptyArray migration", () => {
    it("preserves a same-named local alias and its comments when ESLint applies fixes", () => {
        expect.hasAssertions();

        const code = [
            "export type EmptyArray = readonly [/* no arguments */];",
            "export type LocalUse = EmptyArray;",
        ].join("\n");
        const result = new Linter().verifyAndFix(
            code,
            {
                files: ["**/*.ts"],
                languageOptions: { parser },
                plugins: { typefest: typefestPlugin },
                rules: { "typefest/prefer-type-fest-empty-array": "error" },
            },
            { filename }
        );

        expect(result.messages.map(({ messageId }) => messageId)).toStrictEqual(
            ["preferEmptyArray"]
        );
        expect(result.fixed).toBe(false);
        expect(result.output).toBe(code);
    });
});

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription:
        "require TypeFest EmptyArray for aliases of readonly empty tuples.",
    messages: {
        preferEmptyArray:
            "Use `EmptyArray` from type-fest for this readonly empty tuple alias.",
    },
    name: ruleId,
});

createRuleTester().run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: readTypedFixture("upstream-latest", fixture),
            errors: [{ messageId: "preferEmptyArray", suggestions: [] }],
            filename,
            name: "reports an exported readonly empty tuple alias",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { EmptyArray } from "type-fest"; type NoArguments = EmptyArray;',
            filename,
            name: "accepts the upstream helper",
        },
        {
            code: [
                "type Mutable = [];",
                "type NeverArray = readonly never[];",
                "type Optional = readonly [value?: string];",
                "type Variadic = readonly [...never[]];",
                "type Union = string | readonly [];",
                "type Container = { args: readonly [] };",
                "type Callback = () => readonly [];",
                "declare const args: readonly [];",
            ].join("\n"),
            filename,
            name: "ignores mutable tuples, other array types and nested uses",
        },
        {
            code: readTypedFixture("upstream-latest", fixture),
            filename: typedFixturePath("prefer-ts-extras-array-at.valid.ts"),
            name: "accepts the alias in the TypeFest 5 workspace",
        },
    ],
});
