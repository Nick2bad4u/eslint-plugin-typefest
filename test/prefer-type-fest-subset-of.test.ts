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

const ruleId = "prefer-type-fest-subset-of";
const fixture = "prefer-type-fest-subset-of.ts";
const filename = typedFixturePath("upstream-latest", fixture);
const code = readTypedFixture("upstream-latest", fixture);

describe(ruleId, () => {
    it("produces parseable TypeScript for generated matching expressions", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(fc.nat({ max: 500 }), (index) => {
                const a = `Base${index}`;
                const b = `Value${index}`;
                const input = `type Validate<${a}, ${b} extends ${a}> = ${b};`;
                const output = applyUpstreamRuleFix(ruleId, input, filename);

                expect(output).toContain(`SubsetOf<${a}, ${b}>`);
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
                    data: { replacement: "SubsetOf<Domain, Selection>" },
                    messageId: "preferUpstreamType",
                },
            ],
            filename,
            output: code.replace(
                "type Allowed<Domain, Selection extends Domain> = Selection;",
                "type Allowed<Domain, Selection extends Domain> = SubsetOf<Domain, Selection>;"
            ),
        },
    ],
    valid: [
        {
            code: code.replace(
                "type Allowed<Domain, Selection extends Domain> = Selection;",
                "type Allowed<Domain, Selection extends Domain> = SubsetOf<Domain, Selection>;"
            ),
            filename,
        },
        {
            code: [
                'import type { SubsetOf } from "type-fest";',
                "type Unconstrained<A, B> = B;",
                "type Result<A, B extends A> = A;",
                "type List<A,B extends A[]> = B;",
            ].join("\n"),
            filename,
        },
        { code, filename: typedFixturePath("file.ts") },
    ],
});
