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
    messages: {
        preferTsExtrasIsPropertyPresent: preferTsExtrasIsPropertyPresentMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-is-property-present metadata literals", () => {
    it("declares the authored docs URL and suggestion-only policy", () => {
        expect.hasAssertions();
        expect(rule.meta.docs?.url).toBe(docsUrl);
        expect(rule.meta.fixable).toBeUndefined();
        expect(rule.meta.hasSuggestions).toBe(true);
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

const fixtureCode = readTypedFixture(invalidFixtureName);
const importLine = 'import { isPropertyPresent } from "ts-extras";';

const expectedSuggestion = (
    code: string,
    predicate: string,
    propertyName: string
) => ({
    messageId: "preferTsExtrasIsPropertyPresent" as const,
    suggestions: [
        {
            messageId: "replaceWithIsPropertyPresent" as const,
            output:
                (code.startsWith(importLine) ? "" : `${importLine}\n`) +
                code.replace(
                    predicate,
                    `isPropertyPresent(${JSON.stringify(propertyName)})`
                ),
        },
    ],
});

const getterPredicate = "(post) => post.title != null";
const getterCode = [
    'class BasePost { get title(): string | null { return "Ada"; } }',
    "class Post extends BasePost {}",
    "const posts = [new Post()];",
    `const result = posts.filter(${getterPredicate});`,
].join("\n");

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: fixtureCode,
            errors: [
                expectedSuggestion(
                    fixtureCode,
                    "(post) => post.title != null",
                    "title"
                ),
                expectedSuggestion(
                    fixtureCode,
                    "(post) => post.body != null",
                    "body"
                ),
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "keeps fixture callbacks and offers independent suggestions",
            output: null,
        },
        ...(
            [
                [
                    "(post) => null != post.title",
                    true,
                    "reversed operands",
                ],
                [
                    "(post) => post.title != null",
                    false,
                    "missing import",
                ],
                [
                    "(post) => post.title != null",
                    true,
                    "existing import",
                ],
            ] as const
        ).map(
            ([
                predicate,
                alreadyImported,
                description,
            ]) => {
                const code = [
                    ...(alreadyImported ? [importLine] : []),
                    "interface Post { title: string | null | undefined }",
                    "declare const posts: Post[];",
                    `const result = posts.filter(${predicate});`,
                ].join("\n");

                return {
                    code,
                    errors: [expectedSuggestion(code, predicate, "title")],
                    filename: typedFixturePath(invalidFixtureName),
                    name: `suggests a replacement for ${description}`,
                    output: null,
                };
            }
        ),
        {
            code: getterCode,
            errors: [expectedSuggestion(getterCode, getterPredicate, "title")],
            filename: typedFixturePath(invalidFixtureName),
            name: "keeps native lookup for an inherited getter during autofix",
            output: null,
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
