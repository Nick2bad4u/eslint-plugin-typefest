/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-assert-defined.test` behavior.
 */
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-assert-defined");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-assert-defined.valid.ts";
const invalidFixtureName = "prefer-ts-extras-assert-defined.invalid.ts";
const undefinedOnLeftInvalidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (undefined === value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const looseEqualityInvalidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value == undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineInvalidDirectThrowConsequentCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined)",
    "        throw new TypeError('Missing value');",
    "",
    "    return value;",
    "}",
].join("\n");
const nonUndefinedValidCode = [
    "function ensureValue(value: string | undefined): string | undefined {",
    "    if (value === null) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const nonThrowOnlyValidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        String(value);",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const nonThrowSingleStatementBlockValidCode = [
    "function ensureValue(value: string | undefined): string | undefined {",
    "    if (value === undefined) {",
    "        String(value);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const throwThenSideEffectValidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Missing value');",
    "        String(value);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const alternateValidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    } else {",
    "        String(value);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const nonBinaryGuardValidCode = [
    "function ensureValue(value: string | undefined): string {",
    "    if (!value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const skipPathInvalidCode = undefinedOnLeftInvalidCode;
const inlineSuggestableCode = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableWrongConstructorCode = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new Error('Expected a defined value, got `undefined`');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableTooManyArgsCode = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Expected a defined value, got `undefined`', value);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineAutofixableDirectThrowCanonicalCode = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) throw new TypeError('Expected a defined value, got `undefined`');",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableOutput = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    assertDefined(value);",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineAutofixableCanonicalCode = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    if (value === undefined) {",
    "        throw new TypeError('Expected a defined value, got `undefined`');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineAutofixableCanonicalOutput = [
    'import { assertDefined } from "ts-extras";',
    "",
    "function ensureValue(value: string | undefined): string {",
    "    assertDefined(value);",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineInvalidSuggestionOutputCode = [
    'import { assertDefined } from "ts-extras";',
    "function ensureValue(value: string | undefined): string {",
    "    assertDefined(value);",
    "",
    "    return value;",
    "}",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-ts-extras-assert-defined",
    {
        defaultOptions: [],
        docsDescription:
            "require ts-extras assertDefined over manual undefined-guard throw blocks.",
        enforceRuleShape: true,
        messages: {
            preferTsExtrasAssertDefined:
                "Prefer `assertDefined` from `ts-extras` over manual undefined guard throw blocks.",
            suggestTsExtrasAssertDefined:
                "Replace this manual guard with `assertDefined(...)` from `ts-extras`.",
        },
        name: "prefer-ts-extras-assert-defined",
    }
);

describe("prefer-ts-extras-assert-defined metadata assertions", () => {
    it("retains hasSuggestions metadata for assert-defined", () => {
        expect(rule.meta?.hasSuggestions).toBeTruthy();
    });
});

describe("prefer-ts-extras-assert-defined source assertions", () => {
    it("keeps assert-defined source guard and message canonical checks", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-ts-extras-assert-defined.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain(
            'node.type === "Identifier" && node.name === "undefined"'
        );
        expect(ruleSource).toContain("node.body.length === 1 &&");
        expect(ruleSource).toContain('node.body[0]?.type === "ThrowStatement"');
        expect(ruleSource).toContain(
            "throwStatement.argument.arguments.length !== 1"
        );
        expect(ruleSource).toContain(
            'if (!firstArgument || firstArgument.type === "SpreadElement") {'
        );
        expect(ruleSource).toContain(
            "context.sourceCode.getText(guardExpression)"
        );
        expect(ruleSource).toContain(
            '(test.operator !== "==" && test.operator !== "===")'
        );
        expect(ruleSource).toContain(
            "if (isUndefinedExpression(test.right)) {"
        );
    });

    it("preserves authored metadata literals for assert-defined rule", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-ts-extras-assert-defined.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain('name: "prefer-ts-extras-assert-defined"');
        expect(ruleSource).toContain("defaultOptions: []");
        expect(ruleSource).toContain("hasSuggestions: true,");
        expect(ruleSource).toContain(
            "require ts-extras assertDefined over manual undefined-guard throw blocks."
        );
        expect(ruleSource).toContain(
            "Prefer `assertDefined` from `ts-extras` over manual undefined guard throw blocks."
        );
        expect(ruleSource).toContain(
            "Replace this manual guard with `assertDefined(...)` from `ts-extras`."
        );
    });
});

ruleTester.run("prefer-ts-extras-assert-defined", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                },
                {
                    messageId: "preferTsExtrasAssertDefined",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture guards against undefined",
        },
        {
            code: undefinedOnLeftInvalidCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict undefined guard with literal on left",
        },
        {
            code: looseEqualityInvalidCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports loose equality undefined guard",
        },
        {
            code: inlineInvalidDirectThrowConsequentCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineInvalidSuggestionOutputCode,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct-throw consequent guard",
        },
        {
            code: inlineSuggestableWrongConstructorCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement when canonical message uses non-TypeError constructor",
        },
        {
            code: inlineSuggestableTooManyArgsCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests replacement when TypeError call has multiple arguments",
        },
        {
            code: inlineSuggestableCode,
            errors: [
                {
                    messageId: "preferTsExtrasAssertDefined",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasAssertDefined",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests assertDefined() replacement when import is in scope",
        },
        {
            code: inlineAutofixableCanonicalCode,
            errors: [{ messageId: "preferTsExtrasAssertDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes canonical undefined guard throw when assertDefined import is in scope",
            output: inlineAutofixableCanonicalOutput,
        },
        {
            code: inlineAutofixableDirectThrowCanonicalCode,
            errors: [{ messageId: "preferTsExtrasAssertDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes direct-throw canonical undefined guard",
            output: inlineAutofixableCanonicalOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: nonUndefinedValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores null-only comparison",
        },
        {
            code: nonThrowOnlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guard with extra side-effect statement",
        },
        {
            code: nonThrowSingleStatementBlockValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores single-statement block consequents that are not throws",
        },
        {
            code: throwThenSideEffectValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores multi-statement blocks even when the first statement throws",
        },
        {
            code: alternateValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores guard that includes else branch",
        },
        {
            code: nonBinaryGuardValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-binary guard expression",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-ts-extras-assert-defined.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
