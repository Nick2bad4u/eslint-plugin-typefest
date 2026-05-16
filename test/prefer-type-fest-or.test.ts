/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-or` behavior.
 */
import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-or";
const docsDescription =
    "require TypeFest Or over two-element OrAll boolean tuple checks.";
const message =
    "Prefer `Or<A, B>` from type-fest over `OrAll<[A, B]>` for two-value boolean disjunction checks.";
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
        preferOr: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-or parse-safety guards", () => {
    it("fast-check: Or replacement remains parseable", () => {
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
                        'import type { Or, OrAll } from "type-fest";',
                        `type Result = OrAll<[${leftType}, ${rightType}]>;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = generatedCode.replace(
                        `OrAll<[${leftType}, ${rightType}]>`,
                        `Or<${leftType}, ${rightType}>`
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
                'import type { Or, OrAll } from "type-fest";',
                "",
                "type Either = OrAll<[false, boolean]>;",
            ].join("\n"),
            errors: [{ messageId: "preferOr" }],
            name: "reports direct two-element OrAll tuples",
            output: [
                'import type { Or, OrAll } from "type-fest";',
                "",
                "type Either = Or<false, boolean>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { OrAll as Any, Or } from "type-fest";',
                "",
                "type Either = Any<readonly [boolean, true]>;",
            ].join("\n"),
            errors: [{ messageId: "preferOr" }],
            name: "reports aliased OrAll with readonly two-element tuples",
            output: [
                'import type { OrAll as Any, Or } from "type-fest";',
                "",
                "type Either = Or<boolean, true>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { Or } from "type-fest";',
                "",
                "type Either = TypeFest.OrAll<[true, boolean]>;",
            ].join("\n"),
            errors: [{ messageId: "preferOr" }],
            name: "reports namespace-qualified OrAll pairs",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { Or } from "type-fest";',
                "",
                "type Either = Or<true, boolean>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { OrAll } from "type-fest";',
                "",
                "type Wrapper<Or> = OrAll<[false, false]>;",
            ].join("\n"),
            errors: [{ messageId: "preferOr" }],
            name: "reports without autofix when Or is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { Or } from "type-fest"; type Either = Or<false, boolean>;',
            name: "accepts existing Or usage",
        },
        {
            code: 'import type { OrAll } from "type-fest"; type Many = OrAll<[false, boolean, true]>;',
            name: "ignores OrAll tuples with more than two elements",
        },
        {
            code: 'import type { OrAll } from "type-fest"; type Named = OrAll<[left: true, right: false]>;',
            name: "ignores named tuple elements because generic argument fixes would be invalid",
        },
        {
            code: "type Local = OrAll<[true, false]>;",
            name: "ignores local OrAll types not imported from type-fest",
        },
    ],
});
