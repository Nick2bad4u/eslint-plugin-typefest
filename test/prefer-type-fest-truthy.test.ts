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

const ruleId = "prefer-type-fest-truthy";
const fixture = "prefer-type-fest-truthy.ts";
const filename = typedFixturePath("upstream-latest", fixture);
const code = readTypedFixture("upstream-latest", fixture);

describe(ruleId, () => {
    it("produces parseable TypeScript for generated matching expressions", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(fc.nat({ max: 500 }), (index) => {
                const alias = `Falsy${index}`;
                const input = `import type { Falsy as ${alias} } from "type-fest"; type Filter<T> = NonNullable<Exclude<T, void | ${alias}>>;`;
                const output = applyUpstreamRuleFix(ruleId, input, filename);

                expect(output).toContain("Truthy<T>");
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
                    data: { replacement: "Truthy<T>" },
                    messageId: "preferUpstreamType",
                },
            ],
            filename,
            output: code.replace(
                "type Clean<T> = NonNullable<Exclude<T, Falsy | void>>;",
                "type Clean<T> = Truthy<T>;"
            ),
        },
    ],
    valid: [
        {
            code: code.replace(
                "type Clean<T> = NonNullable<Exclude<T, Falsy | void>>;",
                "type Clean<T> = Truthy<T>;"
            ),
            filename,
        },
        {
            code: [
                'import type { Falsy, Truthy } from "type-fest";',
                "type Partial<T> = NonNullable<T>;",
                "type Local<T,Falsy> = NonNullable<Exclude<T, Falsy | void>>;",
                "type Kept<T> = Exclude<T, Falsy>;",
            ].join("\n"),
            filename,
        },
        { code, filename: typedFixturePath("file.ts") },
    ],
});
