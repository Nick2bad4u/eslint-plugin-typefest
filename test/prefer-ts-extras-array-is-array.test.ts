/**
 * @packageDocumentation
 * Tests for the `prefer-ts-extras-array-is-array` rule.
 */
import { describe, expect, it, vi } from "vitest";

import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-array-is-array";
const validFixture = "prefer-ts-extras-array-is-array.valid.ts";
const invalidFixture = "prefer-ts-extras-array-is-array.invalid.ts";
const filename = typedFixturePath("upstream-latest", validFixture);

createTypedRuleTester().run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: readTypedFixture("upstream-latest", invalidFixture),
            errors: [
                { messageId: "preferTsExtrasArrayIsArray" },
                { messageId: "preferTsExtrasArrayIsArray" },
                { messageId: "preferTsExtrasArrayIsArray" },
            ],
            filename: typedFixturePath("upstream-latest", invalidFixture),
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture("upstream-latest", validFixture),
            filename,
        },
        {
            code: "function check(Array: { isArray(value: unknown): boolean }, value: unknown) { return Array.isArray(value); }",
            filename,
            name: "ignores a local object named Array even when its method accepts unknown",
        },
        {
            code: [
                "declare const count: number, mutable: number[] | string, dynamic: any;",
                "Array.isArray(count); Array.isArray(mutable); Array.isArray(dynamic);",
            ].join("\n"),
            filename,
            name: "keeps checks without a readonly array or an unknown input",
        },
        {
            code: [
                "declare const value: unknown, custom: { isArray(value: unknown): boolean };",
                'custom.isArray(value); Array["isArray"](value); Array.isArray?.(value);',
            ].join("\n"),
            filename,
            name: "keeps custom, computed, and optional calls",
        },
    ],
});

describe("arrayIsArray narrowing", () => {
    it("reads the typed element of a readonly tuple and preserves a scalar in the other branch", async () => {
        expect.hasAssertions();

        const { narrowReadonly } = await vi.importActual<{
            narrowReadonly: (value: readonly [string] | string) => string;
        }>(filename);

        expect(narrowReadonly(["first"])).toBe("first");
        expect(narrowReadonly("whole string")).toBe("whole string");
    });
});
