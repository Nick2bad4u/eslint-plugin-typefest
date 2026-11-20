/**
 * @packageDocumentation
 * Tests for the `prefer-ts-extras-is-truthy` rule.
 */
import { describe, expect, it, vi } from "vitest";

import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-is-truthy";
const validFixture = "prefer-ts-extras-is-truthy.valid.ts";
const invalidFixture = "prefer-ts-extras-is-truthy.invalid.ts";
const filename = typedFixturePath("upstream-latest", validFixture);

createTypedRuleTester().run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: readTypedFixture("upstream-latest", invalidFixture),
            errors: [
                { messageId: "preferTsExtrasIsTruthy" },
                { messageId: "preferTsExtrasIsTruthy" },
                { messageId: "preferTsExtrasIsTruthy" },
                { messageId: "preferTsExtrasIsTruthy" },
                { messageId: "preferTsExtrasIsTruthy" },
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
            code: "function select(values: (string | undefined)[], Boolean: (value: unknown) => boolean) { return values.filter(Boolean); }",
            filename,
            name: "ignores a callback parameter that shadows the global Boolean",
        },
        {
            code: "declare const values: (string | undefined)[]; values.filter(Boolean, {});",
            filename,
            name: "preserves calls with an explicit thisArg",
        },
        {
            code: [
                "declare const numeric: number[], strings: string[], unused: void[], dynamic: any[];",
                "numeric.filter(Boolean); strings.filter(Boolean); unused.filter(Boolean); dynamic.filter(Boolean);",
            ].join("\n"),
            filename,
            name: "skips arrays whose output has no removable falsy type",
        },
        {
            code: [
                "declare const typed: Uint8Array, custom: { filter(callback: BooleanConstructor): (string | undefined)[] };",
                "typed.filter(Boolean); custom.filter(Boolean);",
            ].join("\n"),
            filename,
            name: "requires a native array filter even for a structurally similar result",
        },
        {
            code: [
                "declare const values: (string | undefined)[];",
                'values.filter((value) => !value); values.filter?.(Boolean); values["filter"](Boolean); values.map(Boolean);',
            ].join("\n"),
            filename,
            name: "ignores other callbacks, optional and computed calls, and map",
        },
    ],
});

describe("isTruthy narrowing", () => {
    it("retains only the truthy literals and nonempty strings in input order", async () => {
        expect.hasAssertions();

        const { retainLiterals, retainStrings } = await vi.importActual<{
            retainLiterals: (
                values: readonly (
                    | 0
                    | 0n
                    | 1
                    | ""
                    | "on"
                    | false
                )[]
            ) => (1 | "on")[];
            retainStrings: (
                values: readonly (string | undefined)[]
            ) => string[];
        }>(filename);

        expect(
            retainLiterals([
                0n,
                "on",
                false,
                1,
                "",
                0,
                "on",
            ])
        ).toStrictEqual([
            "on",
            1,
            "on",
        ]);
        expect(
            retainStrings([
                undefined,
                "kept",
                "",
            ])
        ).toStrictEqual(["kept"]);
    });
});
