/**
 * @packageDocumentation
 * Vitest and RuleTester coverage for `prefer-ts-extras-assert`.
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

const ruleId = "prefer-ts-extras-assert";
const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const invalidFixtureName = "prefer-ts-extras-assert.invalid.ts";
const validFixtureName = "prefer-ts-extras-assert.valid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const validFixtureCode = readTypedFixture(validFixtureName);
const invalidFixtureLineEnding = invalidFixtureCode.includes("\r\n")
    ? "\r\n"
    : "\n";
const invalidFixtureFirstSuggestionOutput = [
    'import { assert } from "ts-extras";',
    invalidFixtureCode.replace(
        [
            "    if (!token) {",
            '        throw new Error("Token is required");',
            "    }",
        ].join(invalidFixtureLineEnding),
        '    assert(token, "Token is required");'
    ),
].join("\n");
const invalidFixtureSecondSuggestionOutput = [
    'import { assert } from "ts-extras";',
    invalidFixtureCode.replace(
        "    if (!ready) throw new Error();",
        '    assert(ready, "");'
    ),
].join("\n");

const existingImportCode = [
    'import { assert } from "ts-extras";',
    "declare const ready: boolean;",
    "",
    "if (!ready) {",
    '    throw new Error("Not ready");',
    "}",
].join("\n");
const existingImportSuggestionOutput = [
    'import { assert } from "ts-extras";',
    "declare const ready: boolean;",
    "",
    'assert(ready, "Not ready");',
].join("\n");
const missingImportCode = [
    "declare const ready: boolean;",
    "",
    "if (!ready) throw new Error();",
].join("\n");
const missingImportSuggestionOutput = [
    'import { assert } from "ts-extras";',
    "declare const ready: boolean;",
    "",
    'assert(ready, "");',
].join("\n");
const aliasedImportCode = [
    'import { assert as assertCondition } from "ts-extras";',
    "declare const ready: boolean;",
    "",
    "if (!ready) throw new Error(`Not ready`);",
].join("\n");
const aliasedImportSuggestionOutput = [
    'import { assert as assertCondition } from "ts-extras";',
    "declare const ready: boolean;",
    "",
    "assertCondition(ready, `Not ready`);",
].join("\n");
const commentPreservingReportOnlyCode = [
    'import { assert } from "ts-extras";',
    "declare const ready: boolean;",
    "",
    "if (!ready) {",
    "    // This context must not be deleted by a suggestion.",
    '    throw new Error("Not ready");',
    "}",
].join("\n");

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription:
        "require ts-extras assert over exact manual negated-condition Error guards.",
    messages: {
        preferTsExtrasAssert:
            "Prefer `assert` from `ts-extras` over a manual negated-condition `Error` guard.",
        suggestTsExtrasAssert:
            "Replace this guard with `assert(...)` from `ts-extras` while preserving the error message.",
    },
    name: ruleId,
});

describe("prefer-ts-extras-assert metadata policy", () => {
    it("exposes suggestions without enabling automatic fixes", () => {
        expect.hasAssertions();
        expect(rule.meta?.hasSuggestions).toBe(true);
        expect(rule.meta?.fixable).toBeUndefined();
    });
});

describe("prefer-ts-extras-assert property-based suggestion safety", () => {
    it("parses generated exact guard and suggested assert forms", () => {
        expect.hasAssertions();

        const conditionExpressionArbitrary = fc.constantFrom(
            "ready",
            "state.ready",
            "check()",
            "(left, right)"
        );
        const messageArbitrary = fc.string({
            maxLength: 24,
            unit: fc.constantFrom(" ", "-", "0", "A", "Z", "a", "z", "é", "🧪"),
        });

        fc.assert(
            fc.property(
                conditionExpressionArbitrary,
                messageArbitrary,
                (conditionExpression, message) => {
                    const messageLiteral = JSON.stringify(message);
                    const originalCode = `if (!(${conditionExpression})) throw new Error(${messageLiteral});`;
                    const suggestedCode = `assert(${conditionExpression}, ${messageLiteral});`;

                    expect(() =>
                        parser.parseForESLint(originalCode, {
                            ecmaVersion: "latest",
                            sourceType: "module",
                        })
                    ).not.toThrow();
                    expect(() =>
                        parser.parseForESLint(suggestedCode, {
                            ecmaVersion: "latest",
                            sourceType: "module",
                        })
                    ).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run("prefer-ts-extras-assert fixture coverage", rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssert",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssert",
                            output: invalidFixtureFirstSuggestionOutput,
                        },
                    ],
                },
                {
                    messageId: "preferTsExtrasAssert",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssert",
                            output: invalidFixtureSecondSuggestionOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture exact global Error guard patterns",
        },
    ],
    valid: [
        {
            code: validFixtureCode,
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture preferred and deliberately excluded patterns",
        },
    ],
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: existingImportCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssert",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssert",
                            output: existingImportSuggestionOutput,
                        },
                    ],
                },
            ],
            name: "suggests a literal-message assertion using an existing import",
        },
        {
            code: missingImportCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssert",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssert",
                            output: missingImportSuggestionOutput,
                        },
                    ],
                },
            ],
            name: "suggests an import and preserves the empty Error message",
        },
        {
            code: aliasedImportCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssert",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssert",
                            output: aliasedImportSuggestionOutput,
                        },
                    ],
                },
            ],
            name: "uses an existing aliased assert import",
        },
        {
            code: commentPreservingReportOnlyCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssert",
                    suggestions: [],
                },
            ],
            name: "reports without a suggestion when replacement would remove comments",
        },
    ],
    valid: [
        {
            code: [
                "declare const ready: boolean;",
                "declare const message: string;",
                "if (!ready) throw new Error(message);",
            ].join("\n"),
            name: "ignores computed messages whose evaluation would become eager",
        },
        {
            code: [
                "declare const ready: boolean;",
                "declare const detail: string;",
                `if (!ready) throw new Error(\`Not ready: \${detail}\`);`,
            ].join("\n"),
            name: "ignores template messages with expressions",
        },
        {
            code: [
                "declare const ready: boolean;",
                'if (!ready) throw new TypeError("Not ready");',
            ].join("\n"),
            name: "ignores a different error class",
        },
        {
            code: [
                "const Error = class extends globalThis.Error {};",
                "declare const ready: boolean;",
                'if (!ready) throw new Error("Not ready");',
            ].join("\n"),
            name: "ignores a shadowed Error constructor",
        },
        {
            code: [
                "declare const ready: boolean;",
                'if (!ready) throw Error("Not ready");',
            ].join("\n"),
            name: "ignores Error function calls instead of constructor calls",
        },
        {
            code: [
                "declare const ready: boolean;",
                'if (!ready) throw new globalThis.Error("Not ready");',
            ].join("\n"),
            name: "ignores qualified Error constructors",
        },
        {
            code: [
                "declare const ready: boolean;",
                'if (!ready) throw new Error("Not ready", { cause: ready });',
            ].join("\n"),
            name: "ignores Error constructors with cause metadata",
        },
        {
            code: [
                "declare const ready: boolean;",
                "if (!ready) {",
                '    throw new Error("Not ready");',
                "    void ready;",
                "}",
            ].join("\n"),
            name: "ignores guard blocks containing additional statements",
        },
        {
            code: [
                "declare const ready: boolean;",
                "if (!ready) {",
                '    throw new Error("Not ready");',
                "} else {",
                "    void ready;",
                "}",
            ].join("\n"),
            name: "ignores guards with an alternate branch",
        },
        {
            code: [
                "declare const ready: boolean;",
                'if (ready) throw new Error("Unexpected readiness");',
            ].join("\n"),
            name: "ignores non-negated conditions",
        },
    ],
});
