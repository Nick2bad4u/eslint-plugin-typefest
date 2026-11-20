import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { testOverloadExtraction } from "./_internal/overload-extraction";
import { typedFixturePath } from "./_internal/typed-rule-tester";
import { applyUpstreamRuleFix } from "./_internal/upstream-fix-output";

testOverloadExtraction({
    fixtureAliases: [
        "Args<Signatures<typeof convert>[number]>",
        "TF.FunctionParameters<TF.Overloads<typeof convert>[number]>",
    ],
    helper: "OverloadParameters",
    imports: "FunctionParameters, Overloads, OverloadParameters",
    ruleName: "prefer-type-fest-overload-parameters",
    wrapper: "FunctionParameters",
});

describe("overload extraction fixes", () => {
    it("parses the OverloadParameters autofix for compound callable types", () => {
        expect.hasAssertions();

        const filename = typedFixturePath(
            "upstream-latest",
            "prefer-type-fest-overload-parameters.ts"
        );
        fc.assert(
            fc.property(
                fc.constantFrom(
                    "typeof parse",
                    "typeof parse | typeof serialize",
                    "(...args: [name: string]) => number",
                    "((value: number) => string) & (() => number)"
                ),
                (input) => {
                    const before = [
                        'import type { FunctionParameters, Overloads, OverloadParameters } from "type-fest";',
                        "declare function parse(input: string): number;",
                        "declare function serialize(input: number): string;",
                        `type Result = FunctionParameters<Overloads<${input}>[number]>;`,
                    ].join("\n");
                    const fixed = applyUpstreamRuleFix(
                        "prefer-type-fest-overload-parameters",
                        before,
                        filename
                    );

                    expect(fixed).toContain(
                        `type Result = OverloadParameters<${input}>;`
                    );
                    expect(parser.parseForESLint(fixed).ast.body).toHaveLength(
                        4
                    );
                }
            ),
            fastCheckRunConfig.default
        );
    });
});
