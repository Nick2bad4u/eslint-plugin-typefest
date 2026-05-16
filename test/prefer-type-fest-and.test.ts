/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-and` behavior.
 */
import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-and";
const docsDescription =
    "require TypeFest And over two-element AndAll boolean tuple checks.";
const message =
    "Prefer `And<A, B>` from type-fest over `AndAll<[A, B]>` for two-value boolean conjunction checks.";
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;
const booleanTypeArbitrary = fc.constantFrom("true", "false", "boolean");

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferAnd: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-and parse-safety guards", () => {
    it("fast-check: And replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                booleanTypeArbitrary,
                booleanTypeArbitrary,
                fc.boolean(),
                (leftType, rightType, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { And, AndAll } from "type-fest";',
                        `type Result = AndAll<[${leftType}, ${rightType}]>;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = generatedCode.replace(
                        `AndAll<[${leftType}, ${rightType}]>`,
                        `And<${leftType}, ${rightType}>`
                    );

                    expect(() => {
                        parser.parseForESLint(generatedCode, parserOptions);
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: [
                'import type { And, AndAll } from "type-fest";',
                "",
                "type Both = AndAll<[true, boolean]>;",
            ].join("\n"),
            errors: [{ messageId: "preferAnd" }],
            name: "reports direct two-element AndAll tuples",
            output: [
                'import type { And, AndAll } from "type-fest";',
                "",
                "type Both = And<true, boolean>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { AndAll as All, And } from "type-fest";',
                "",
                "type Both = All<readonly [boolean, false]>;",
            ].join("\n"),
            errors: [{ messageId: "preferAnd" }],
            name: "reports aliased AndAll with readonly two-element tuples",
            output: [
                'import type { AndAll as All, And } from "type-fest";',
                "",
                "type Both = And<boolean, false>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { And } from "type-fest";',
                "",
                "type Both = TypeFest.AndAll<[false, boolean]>;",
            ].join("\n"),
            errors: [{ messageId: "preferAnd" }],
            name: "reports namespace-qualified AndAll pairs",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { And } from "type-fest";',
                "",
                "type Both = And<false, boolean>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { AndAll } from "type-fest";',
                "",
                "type Wrapper<And> = AndAll<[true, true]>;",
            ].join("\n"),
            errors: [{ messageId: "preferAnd" }],
            name: "reports without autofix when And is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { And } from "type-fest"; type Both = And<true, boolean>;',
            name: "accepts existing And usage",
        },
        {
            code: 'import type { AndAll } from "type-fest"; type Many = AndAll<[true, boolean, false]>;',
            name: "ignores AndAll tuples with more than two elements",
        },
        {
            code: 'import type { AndAll } from "type-fest"; type Named = AndAll<[left: true, right: false]>;',
            name: "ignores named tuple elements because generic argument fixes would be invalid",
        },
        {
            code: "type Local = AndAll<[true, false]>;",
            name: "ignores local AndAll types not imported from type-fest",
        },
    ],
});
