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
import { expectedAliasReplacement } from "./_internal/upstream-type-fixture";

const ruleId = "prefer-type-fest-minimum-length-array";
const fixture = "prefer-type-fest-minimum-length-array.ts";
const filename = typedFixturePath("upstream-latest", fixture);
const code = readTypedFixture("upstream-latest", fixture);

describe(ruleId, () => {
    it("produces parseable TypeScript for generated matching expressions", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(fc.integer({ max: 12, min: 2 }), (length) => {
                const input = `type Batch<T> = [${Array.from({ length }, () => "T").join(", ")}, ...T[]];`;
                const output = applyUpstreamRuleFix(ruleId, input, filename);

                expect(output).toContain(`MinimumLengthArray<T, ${length}>`);
                expect(() =>
                    parser.parseForESLint(output, { sourceType: "module" })
                ).not.toThrow();
            }),
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
                    data: { replacement: "MinimumLengthArray<T, 2>" },
                    messageId: "preferUpstreamType",
                },
            ],
            filename,
            output: expectedAliasReplacement(
                code,
                "Batch",
                "MinimumLengthArray<T, 2>"
            ),
        },
    ],
    valid: [
        {
            code: expectedAliasReplacement(
                code,
                "Batch",
                "MinimumLengthArray<T, 2>"
            ),
            filename,
        },
        {
            code: [
                'import type { MinimumLengthArray } from "type-fest";',
                "type Nonempty<T> = [T, ...T[]];",
                "type Fixed<T> = [T, T];",
                "type ReadOnly<T> = readonly [T, T, ...T[]];",
                "type Different<T> = [string, T, ...T[]];",
                "type Labeled<T> = [a:T, b:T, ...c:T[]];",
            ].join("\n"),
            filename,
        },
        { code, filename: typedFixturePath("file.ts") },
    ],
});
