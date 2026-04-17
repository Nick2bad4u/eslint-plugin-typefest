/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-property-present` behavior.
 */
import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-is-property-present";
const docsDescription =
    "require ts-extras isPropertyPresent in Array.filter callbacks instead of inline property-nullish checks.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-property-present";
const preferTsExtrasIsPropertyPresentMessage =
    "Prefer `isPropertyPresent` from `ts-extras` over an inline property-nullish filter callback.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-property-present.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-property-present.invalid.ts";

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasIsPropertyPresent: preferTsExtrasIsPropertyPresentMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-is-property-present metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect.hasAssertions();
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

describe("prefer-ts-extras-is-property-present parse-safety guards", () => {
    it("fast-check: isPropertyPresent replacement produces valid call expression text", () => {
        expect.hasAssertions();

        const propNameArbitrary = fc.constantFrom("title", "body", "content");

        fc.assert(
            fc.property(propNameArbitrary, (propName) => {
                const replacement = `isPropertyPresent(${JSON.stringify(propName)})`;

                expect(replacement).toContain("isPropertyPresent(");
                expect(replacement).toContain(JSON.stringify(propName));

                const codeToCheck = `const arr = [].filter(${replacement});`;

                expect(() => {
                    parser.parseForESLint(codeToCheck, parserOptions);
                }).not.toThrow();
            }),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                { messageId: "preferTsExtrasIsPropertyPresent" },
                { messageId: "preferTsExtrasIsPropertyPresent" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture inline property-nullish filter callbacks",
            // Pass 1: first error claims the import (title fixed); second error
            // suppressed because it can't also insert the import in the same pass.
            // Pass 2: both remaining callbacks fixed (import already present,
            // no coordination needed).
            output: [
                `import { isPropertyPresent } from "ts-extras";\n${readTypedFixture(
                    invalidFixtureName
                ).replace(
                    "(post) => post.title != null",
                    'isPropertyPresent("title")'
                )}`,
                `import { isPropertyPresent } from "ts-extras";\n${readTypedFixture(
                    invalidFixtureName
                )
                    .replace(
                        "(post) => post.title != null",
                        'isPropertyPresent("title")'
                    )
                    .replace(
                        "(post) => post.body != null",
                        'isPropertyPresent("body")'
                    )}`,
            ],
        },
        {
            code: [
                'import { isPropertyPresent } from "ts-extras";',
                "interface Post { title: string | null | undefined }",
                "declare const posts: Post[];",
                "const titled = posts.filter((post) => post.title != null);",
            ].join("\n"),
            errors: [{ messageId: "preferTsExtrasIsPropertyPresent" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports item.prop != null and autofixes to isPropertyPresent when import exists",
            output: [
                'import { isPropertyPresent } from "ts-extras";',
                "interface Post { title: string | null | undefined }",
                "declare const posts: Post[];",
                'const titled = posts.filter(isPropertyPresent("title"));',
            ].join("\n"),
        },
        {
            code: [
                "interface Post { title: string | null | undefined }",
                "declare const posts: Post[];",
                "const titled = posts.filter((post) => post.title != null);",
            ].join("\n"),
            errors: [{ messageId: "preferTsExtrasIsPropertyPresent" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports item.prop != null and inserts isPropertyPresent import when absent",
            output: [
                'import { isPropertyPresent } from "ts-extras";',
                "interface Post { title: string | null | undefined }",
                "declare const posts: Post[];",
                'const titled = posts.filter(isPropertyPresent("title"));',
            ].join("\n"),
        },
        {
            code: [
                'import { isPropertyPresent } from "ts-extras";',
                "interface Post { title: string | null | undefined }",
                "declare const posts: Post[];",
                "const titled = posts.filter((post) => null != post.title);",
            ].join("\n"),
            errors: [{ messageId: "preferTsExtrasIsPropertyPresent" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports null != item.prop (reversed order) and autofixes",
            output: [
                'import { isPropertyPresent } from "ts-extras";',
                "interface Post { title: string | null | undefined }",
                "declare const posts: Post[];",
                'const titled = posts.filter(isPropertyPresent("title"));',
            ].join("\n"),
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns using isPropertyPresent",
        },
        {
            code: [
                "interface Post { title: string | null | undefined }",
                "declare const posts: Post[];",
                "const titled = posts.filter((post) => post !== null);",
            ].join("\n"),
            filename: typedFixturePath(validFixtureName),
            name: "accepts filter callback checking the whole item (not a property)",
        },
        {
            code: [
                "interface Post { title: string | null | undefined }",
                "declare const posts: Post[];",
                "const titled = posts.filter((post) => post.title !== null);",
            ].join("\n"),
            filename: typedFixturePath(validFixtureName),
            name: "accepts strict null check (not loose nullish check)",
        },
        {
            code: [
                "interface Post { meta: { title: string | null | undefined } }",
                "declare const posts: Post[];",
                "const titled = posts.filter((post) => post.meta.title != null);",
            ].join("\n"),
            filename: typedFixturePath(validFixtureName),
            name: "accepts deep member access (only single-level property check is flagged)",
        },
        {
            code: [
                "interface Post { title: string | null | undefined }",
                "declare const posts: Post[];",
                "const titles = posts.map((post) => post.title != null);",
            ].join("\n"),
            filename: typedFixturePath(validFixtureName),
            name: "accepts the same pattern in map (only filter is flagged)",
        },
    ],
});
