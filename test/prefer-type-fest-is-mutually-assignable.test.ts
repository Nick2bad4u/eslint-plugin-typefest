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

const ruleId = "prefer-type-fest-is-mutually-assignable";
const fixture = "prefer-type-fest-is-mutually-assignable.ts";
const filename = typedFixturePath("upstream-latest", fixture);
const code = readTypedFixture("upstream-latest", fixture);

describe(ruleId, () => {
    it("produces parseable TypeScript for generated matching expressions", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(fc.nat({ max: 500 }), (index) => {
                const a = `Left${index}`;
                const b = `Right${index}`;
                const input = `type Pair<${a}, ${b}> = [${a}] extends [${b}] ? [${b}] extends [${a}] ? true : false : false;`;
                const output = applyUpstreamRuleFix(ruleId, input, filename);

                expect(output).toContain(`IsMutuallyAssignable<${a}, ${b}>`);
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
                    data: { replacement: "IsMutuallyAssignable<A, B>" },
                    messageId: "preferUpstreamType",
                },
            ],
            filename,
            output: expectedAliasReplacement(
                code,
                "Compatible",
                "IsMutuallyAssignable<A, B>"
            ),
        },
    ],
    valid: [
        {
            code: expectedAliasReplacement(
                code,
                "Compatible",
                "IsMutuallyAssignable<A, B>"
            ),
            filename,
        },
        {
            code: [
                'import type { IsMutuallyAssignable } from "type-fest";',
                "type OneWay<A, B> = [A] extends [B] ? true : false;",
                "type Distributive<A, B> = A extends B ? B extends A ? true : false : false;",
                "type Different<A, B, C> = [A] extends [B] ? [C] extends [A] ? true : false : false;",
            ].join("\n"),
            filename,
        },
        { code, filename: typedFixturePath("file.ts") },
    ],
});
