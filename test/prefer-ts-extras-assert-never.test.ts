/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-assert-never` behavior.
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

const ruleId = "prefer-ts-extras-assert-never";
const docsDescription =
    "require ts-extras assertNever over manual `const _: never = value` exhaustiveness checks.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-assert-never";
const preferTsExtrasAssertNeverMessage =
    "Prefer `assertNever` from `ts-extras` over a manual `const _: never` exhaustiveness assertion.";
const suggestTsExtrasAssertNeverMessage =
    "Replace this manual exhaustiveness check with `assertNever(...)` from `ts-extras`.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-assert-never.valid.ts";
const invalidFixtureName = "prefer-ts-extras-assert-never.invalid.ts";

const inlineInvalidCode = [
    "function check(value: never): never {",
    "    const _exhaustiveCheck: never = value;",
    "    return _exhaustiveCheck;",
    "}",
].join("\n");

const inlineInvalidWithImportCode = [
    'import { assertNever } from "ts-extras";',
    "",
    "function check(value: never): never {",
    "    const _exhaustiveCheck: never = value;",
    "    return _exhaustiveCheck;",
    "}",
].join("\n");

const inlineInvalidWithImportSuggestionOutput = [
    'import { assertNever } from "ts-extras";',
    "",
    "function check(value: never): never {",
    "    assertNever(value)",
    "    return _exhaustiveCheck;",
    "}",
].join("\n");

const inlineLetNeverValidCode = [
    "function check(value: never): void {",
    "    let _: never = value;",
    "    String(_);",
    "}",
].join("\n");

const inlineNoTypeAnnotationValidCode = [
    "function check(value: string): void {",
    "    const _ = value;",
    "    String(_);",
    "}",
].join("\n");

const inlineNonNeverAnnotationValidCode = [
    "function check(value: string): void {",
    "    const _: string = value;",
    "    String(_);",
    "}",
].join("\n");

const inlineMultipleDeclaratorsValidCode = [
    "function check(a: never, b: never): void {",
    "    const _a: never = a, _b: never = b;",
    "    String(_a);",
    "    String(_b);",
    "}",
].join("\n");

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferTsExtrasAssertNever: preferTsExtrasAssertNeverMessage,
        suggestTsExtrasAssertNever: suggestTsExtrasAssertNeverMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-assert-never metadata literals", () => {
    it("declares the authored docs URL and hasSuggestions literals", () => {
        expect.hasAssertions();
        expect(rule.meta.docs?.url).toBe(docsUrl);
        expect(rule.meta.hasSuggestions).toBeTruthy();
    });
});

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

describe("prefer-ts-extras-assert-never parse-safety guards", () => {
    it("fast-check: assertNever replacement produces valid call expression text", () => {
        expect.hasAssertions();

        const variableNameArbitrary = fc.constantFrom(
            "value",
            "exhaustive",
            "_check"
        );
        const variantNameArbitrary = fc.constantFrom(
            "FruitKind",
            "Color",
            "Mode"
        );

        fc.assert(
            fc.property(
                variableNameArbitrary,
                variantNameArbitrary,
                (variableName, variantName) => {
                    const initText = variableName;
                    const replacement = `assertNever(${initText})`;

                    expect(replacement).toContain("assertNever(");
                    expect(replacement).toContain(variableName);
                    expect(variantName).toBeTruthy();

                    const codeToCheck = `${replacement};`;

                    expect(() => {
                        parser.parseForESLint(codeToCheck, parserOptions);
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasAssertNever",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertNever",
                            output: `import { assertNever } from "ts-extras";\n${readTypedFixture(
                                invalidFixtureName
                            ).replace(
                                "const _exhaustiveCheck: never = fruit;",
                                "assertNever(fruit)"
                            )}`,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture const _exhaustiveCheck: never = fruit usage",
        },
        {
            code: inlineInvalidCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertNever",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertNever",
                            output: [
                                'import { assertNever } from "ts-extras";',
                                "function check(value: never): never {",
                                "    assertNever(value)",
                                "    return _exhaustiveCheck;",
                                "}",
                            ].join("\n"),
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports const _: never = value pattern without import",
        },
        {
            code: inlineInvalidWithImportCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertNever",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertNever",
                            output: inlineInvalidWithImportSuggestionOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports const _: never = value pattern and provides suggestion when ts-extras is imported",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns using assertNever",
        },
        {
            code: inlineLetNeverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "accepts let declarations (only const is flagged)",
        },
        {
            code: inlineNoTypeAnnotationValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "accepts const without type annotation",
        },
        {
            code: inlineNonNeverAnnotationValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "accepts const with non-never type annotation",
        },
        {
            code: inlineMultipleDeclaratorsValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "accepts const with multiple declarators (only single declarator is flagged)",
        },
    ],
});
