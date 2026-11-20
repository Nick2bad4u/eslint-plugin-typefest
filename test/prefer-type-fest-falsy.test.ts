import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";
import {
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";
import { applyUpstreamRuleFix } from "./_internal/upstream-fix-output";

const ruleId = "prefer-type-fest-falsy";
const fixture = "prefer-type-fest-falsy.ts";
const filename = typedFixturePath("upstream-latest", fixture);
const code = readTypedFixture("upstream-latest", fixture);

describe(ruleId, () => {
    it("produces parseable TypeScript for generated matching expressions", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.shuffledSubarray(
                    [
                        "false",
                        "0",
                        "0n",
                        "''",
                        "null",
                        "undefined",
                    ],
                    { maxLength: 6, minLength: 6 }
                ),
                (members) => {
                    const input = `type Flag = ${members.join(" | ")};`;
                    const output = applyUpstreamRuleFix(
                        ruleId,
                        input,
                        filename
                    );

                    expect(output).toContain("type Flag = Falsy;");
                    expect(() =>
                        parser.parseForESLint(output, { sourceType: "module" })
                    ).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

createRuleTester().run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code,
            errors: [
                {
                    data: { replacement: "Falsy" },
                    messageId: "preferUpstreamType",
                },
            ],
            filename,
            output: code.replace(
                "type Local = false | null | 0n | undefined | '' | 0;",
                "type Local = Falsy;"
            ),
        },
    ],
    valid: [
        {
            code: code.replace(
                "type Local = false | null | 0n | undefined | '' | 0;",
                "type Local = Falsy;"
            ),
            filename,
        },
        {
            code: [
                'import type { Falsy } from "type-fest";',
                "type MissingBigInt = false | null | undefined | '' | 0;",
                "type TooBroad = boolean | null | 0n | undefined | '' | 0;",
            ].join("\n"),
            filename,
        },
        { code, filename: typedFixturePath("file.ts") },
    ],
});
