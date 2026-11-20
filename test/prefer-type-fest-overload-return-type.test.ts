import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { testOverloadExtraction } from "./_internal/overload-extraction";
import { typedFixturePath } from "./_internal/typed-rule-tester";
import { applyUpstreamRuleFix } from "./_internal/upstream-fix-output";

testOverloadExtraction({
    fixtureAliases: [
        "ReturnType<Signatures<typeof convert>[number]>",
        "ReturnType<TF.Overloads<typeof convert>[number]>",
    ],
    helper: "OverloadReturnType",
    imports: "Overloads, OverloadReturnType",
    ruleName: "prefer-type-fest-overload-return-type",
    wrapper: "ReturnType",
});

describe("overload extraction fixes", () => {
    it("parses the OverloadReturnType autofix for compound callable types", () => {
        expect.hasAssertions();

        const filename = typedFixturePath(
            "upstream-latest",
            "prefer-type-fest-overload-return-type.ts"
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
                        'import type { Overloads, OverloadReturnType } from "type-fest";',
                        "declare function parse(input: string): number;",
                        "declare function serialize(input: number): string;",
                        `type Result = ReturnType<Overloads<${input}>[number]>;`,
                    ].join("\n");
                    const fixed = applyUpstreamRuleFix(
                        "prefer-type-fest-overload-return-type",
                        before,
                        filename
                    );

                    expect(fixed).toContain(
                        `type Result = OverloadReturnType<${input}>;`
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
