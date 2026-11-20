import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";
import {
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";
import { applyUpstreamRuleFix } from "./_internal/upstream-fix-output";

const ruleName = "prefer-type-fest-not";
const filename = typedFixturePath("upstream-latest", "prefer-type-fest-not.ts");
const fixture = readTypedFixture("upstream-latest", "prefer-type-fest-not.ts");
const messageId = "preferUpstreamType";
const namespacePrefix =
    'import type * as Types from "type-fest"; import type { Not } from "type-fest"; ';

addTypeFestRuleMetadataSmokeTests(ruleName);

describe(ruleName, () => {
    it("reparses autofixes for nested and aliased boolean conditions", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.nat({ max: 9999 }),
                fc.constantFrom(
                    "false",
                    "true",
                    "never",
                    "boolean",
                    "Flag extends true ? true : false",
                    "Flag | false"
                ),
                (suffix, condition) => {
                    const prefix = `import type { If as Choose${suffix}, Not } from "type-fest"; type Result<Flag extends boolean> = `;
                    const fixed = applyUpstreamRuleFix(
                        ruleName,
                        `${prefix}Choose${suffix}<${condition}, false, true>;`,
                        filename
                    );

                    expect(fixed).toBe(`${prefix}Not<${condition}>;`);
                    expect(() =>
                        parser.parseForESLint(fixed, { sourceType: "module" })
                    ).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

createRuleTester().run(ruleName, getPluginRule(ruleName), {
    invalid: [
        {
            code: fixture,
            errors: [{ messageId }],
            filename,
            output: fixture.replace("Choose<Flag, false, true>", "Not<Flag>"),
        },
        {
            code: `${namespacePrefix}type T = Types.If<false | true, false, true>;`,
            errors: [{ messageId }],
            filename,
            output: `${namespacePrefix}type T = Not<false | true>;`,
        },
        {
            code: 'import type { If, Not } from "type-fest"; type T = If<never, /* reason */ false, true>;',
            errors: [{ messageId }],
            filename,
            output: null,
        },
        {
            code: 'import type { If, Not } from "type-fest"; namespace Inner { type Not<T> = T; export type T = If<true, false, true>; }',
            errors: [{ messageId }],
            filename,
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { If, Not } from "type-fest"; type A = If<false, true, false>; type B = If<true, false, boolean>; type C = Not<boolean>;',
            filename,
        },
        {
            code: 'import type { If as Choose } from "type-fest"; namespace Shadow { type Choose<A, B, C> = A; export type T = Choose<boolean, false, true>; }',
            filename,
        },
        {
            code: 'import type { If } from "elsewhere"; type T = If<true, false, true>; type Raw<A> = A extends true ? false : true;',
            filename,
        },
    ],
});
