/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-extract-rest-element` behavior.
 */
import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-extract-rest-element";
const docsDescription =
    "require TypeFest ExtractRestElement over SplitOnRestElement<T>[1][number] rest-element extraction.";
const message =
    "Prefer `ExtractRestElement<T>` from type-fest over `SplitOnRestElement<T>[1][number]`.";
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;
const tupleTypeArbitrary = fc.constantFrom(
    "[number, ...string[], boolean]",
    "readonly [...boolean[], string]",
    "Tuple"
);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferExtractRestElement: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-extract-rest-element parse-safety guards", () => {
    it("fast-check: ExtractRestElement replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                tupleTypeArbitrary,
                fc.boolean(),
                (tupleType, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { ExtractRestElement, SplitOnRestElement } from "type-fest";',
                        `type Rest = SplitOnRestElement<${tupleType}>[1][number];`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = generatedCode.replace(
                        `SplitOnRestElement<${tupleType}>[1][number]`,
                        `ExtractRestElement<${tupleType}>`
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
                'import type { SplitOnRestElement } from "type-fest";',
                "",
                "type Rest = SplitOnRestElement<[number, ...string[], boolean]>[1][number];",
            ].join("\n"),
            errors: [{ messageId: "preferExtractRestElement" }],
            name: "reports direct SplitOnRestElement rest extraction",
            output: [
                'import type { SplitOnRestElement } from "type-fest";',
                'import type { ExtractRestElement } from "type-fest";',
                "",
                "type Rest = ExtractRestElement<[number, ...string[], boolean]>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { SplitOnRestElement as SplitRest, ExtractRestElement } from "type-fest";',
                "",
                "type Rest = SplitRest<readonly [...boolean[], string]>[1][number];",
            ].join("\n"),
            errors: [{ messageId: "preferExtractRestElement" }],
            name: "reports aliased SplitOnRestElement rest extraction",
            output: [
                'import type { SplitOnRestElement as SplitRest, ExtractRestElement } from "type-fest";',
                "",
                "type Rest = ExtractRestElement<readonly [...boolean[], string]>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { ExtractRestElement } from "type-fest";',
                "",
                "type Rest = TypeFest.SplitOnRestElement<Tuple>[1][number];",
            ].join("\n"),
            errors: [{ messageId: "preferExtractRestElement" }],
            name: "reports namespace-qualified SplitOnRestElement rest extraction",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { ExtractRestElement } from "type-fest";',
                "",
                "type Rest = ExtractRestElement<Tuple>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { SplitOnRestElement } from "type-fest";',
                "",
                "type Wrapper<ExtractRestElement> = SplitOnRestElement<Tuple>[1][number];",
            ].join("\n"),
            errors: [{ messageId: "preferExtractRestElement" }],
            name: "reports without autofix when ExtractRestElement is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { ExtractRestElement } from "type-fest"; type Rest = ExtractRestElement<Tuple>;',
            name: "accepts existing ExtractRestElement usage",
        },
        {
            code: 'import type { SplitOnRestElement } from "type-fest"; type Prefix = SplitOnRestElement<Tuple>[0];',
            name: "ignores non-rest tuple segments",
        },
        {
            code: 'import type { SplitOnRestElement } from "type-fest"; type RestTuple = SplitOnRestElement<Tuple>[1];',
            name: "ignores the full rest tuple segment",
        },
        {
            code: "type Local = SplitOnRestElement<Tuple>[1][number];",
            name: "ignores local SplitOnRestElement types not imported from type-fest",
        },
    ],
});
