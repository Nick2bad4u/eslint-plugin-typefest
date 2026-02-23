/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-assert-present.valid.ts";
const invalidFixtureName = "prefer-ts-extras-assert-present.invalid.ts";

const inlineInvalidEqNullCode = [
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

const inlineInvalidLogicalCode = [
    "function ensureValue(value: string | null | undefined): string {",
    "    if (value === null || value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

const inlineInvalidLogicalReversedCode = [
    "function ensureValue(value: string | null | undefined): string {",
    "    if (undefined === value || null === value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

const nonThrowConsequentValidCode = [
    "function ensureValue(value: string | null): string | null {",
    "    if (value == null) {",
    "        return null;",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

const multiStatementThrowBlockValidCode = [
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        String(value);",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

const sameKindLogicalValidCode = [
    "function ensureValue(value: string | null): string | null {",
    "    if (value === null || value === null) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const alternateBranchValidCode = [
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        throw new TypeError('Missing value');",
    "    } else {",
    "        return value;",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const mismatchedLogicalExpressionValidCode = [
    "function ensureValue(value: string | null | undefined, fallback: string | null | undefined): string {",
    "    if (value === null || fallback === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value ?? fallback ?? 'fallback';",
    "}",
].join("\n");
const nonNullishLogicalValidCode = [
    "function ensureValue(value: string | null | undefined): string {",
    "    if (value === '' || value === 'missing') {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value ?? 'fallback';",
    "}",
].join("\n");
const nonEqualityTestValidCode = [
    "function ensureValue(value: string | null | undefined): string {",
    "    if (!value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const invalidNullOnLeftEqGuardCode = [
    "function ensureValue(value: string | null): string {",
    "    if (null == value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const invalidDirectThrowConsequentCode = [
    "function ensureValue(value: string | null): string {",
    "    if (value == null) throw new TypeError('Missing value');",
    "",
    "    return value;",
    "}",
].join("\n");
const binaryEqWithoutNullValidCode = [
    "function ensureValue(value: string | null, fallback: string): string {",
    "    if (value == fallback) {",
    "        throw new TypeError('Unexpected equality');",
    "    }",
    "",
    "    return value ?? fallback;",
    "}",
].join("\n");
const binaryEqAgainstZeroValidCode = [
    "function ensureValue(value: number | null): number | null {",
    "    if (value == 0) {",
    "        throw new TypeError('Unexpected zero');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const logicalWithNonBinaryTermValidCode = [
    "function ensureValue(value: string | null): string {",
    "    if (value === null || !value) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const logicalAndNullishValidCode = [
    "function ensureValue(value: string | null | undefined): string | null | undefined {",
    "    if (value === null && value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

const skipPathInvalidCode = inlineInvalidEqNullCode;
const inlineSuggestableCode = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null | undefined): string {",
    "    if (value === null || value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableMixedEqStrictCode = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null | undefined): string {",
    "    if (value == null || value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableOutput = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null | undefined): string {",
    "    assertPresent(value);",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableTemplateWrongPrefixCode = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        throw new TypeError(`Unexpected value: ${value}`);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableTemplateWrongSuffixCode = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        throw new TypeError(`Expected a present value, got ${value}!`);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableTemplateWrongExpressionCode = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null, fallback: string): string {",
    "    if (value == null) {",
    "        throw new TypeError(`Expected a present value, got ${fallback}`);",
    "    }",
    "",
    "    return value ?? fallback;",
    "}",
].join("\n");
const inlineAutofixableCanonicalCode = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null | undefined): string {",
    "    if (value === null || value === undefined) {",
    "        throw new TypeError(`Expected a present value, got " +
        "$" +
        "{value}`);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineAutofixableCanonicalBacktickEnvelopeCode = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        throw new TypeError(`Expected a present value, got \\`${value}\\``);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineAutofixableDirectThrowCanonicalCode = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null): string {",
    "    if (value == null) throw new TypeError(`Expected a present value, got ${value}`);",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineAutofixableCanonicalOutput = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null | undefined): string {",
    "    assertPresent(value);",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineSuggestableTemplateWrongExpressionOutput = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null, fallback: string): string {",
    "    assertPresent(value);",
    "",
    "    return value ?? fallback;",
    "}",
].join("\n");
const inlineInvalidNullableSuggestionOutputCode = [
    'import { assertPresent } from "ts-extras";',
    "function ensureValue(value: string | null): string {",
    "    assertPresent(value);",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineInvalidNullableSuggestionOutputWithImportGapCode = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null): string {",
    "    assertPresent(value);",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineInvalidNullishSuggestionOutputCode = [
    'import { assertPresent } from "ts-extras";',
    "function ensureValue(value: string | null | undefined): string {",
    "    assertPresent(value);",
    "",
    "    return value;",
    "}",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-ts-extras-assert-present",
    {
        defaultOptions: [],
        docsDescription:
            "require ts-extras assertPresent over manual nullish-guard throw blocks.",
        enforceRuleShape: true,
        messages: {
            preferTsExtrasAssertPresent:
                "Prefer `assertPresent` from `ts-extras` over manual nullish guard throw blocks.",
            suggestTsExtrasAssertPresent:
                "Replace this manual guard with `assertPresent(...)` from `ts-extras`.",
        },
        name: "prefer-ts-extras-assert-present",
    }
);

it("keeps assert-present guard and canonical-template checks in source", () => {
    const ruleSource = readFileSync(
        path.resolve(
            process.cwd(),
            "src/rules/prefer-ts-extras-assert-present.ts"
        ),
        "utf8"
    );

    expect(ruleSource).toContain(
        'node.type === "Literal" && node.value === null;'
    );
    expect(ruleSource).toContain("node.body.length === 1 &&");
    expect(ruleSource).toContain('if (node.type === "ThrowStatement") {');
    expect(ruleSource).toContain(
        'throwStatement.argument.callee.name !== "TypeError" ||'
    );
    expect(ruleSource).toContain(
        "throwStatement.argument.arguments.length !== 1"
    );
    expect(ruleSource).toContain(
        'firstArgument.type === "SpreadElement" ||'
    );
    expect(ruleSource).toContain(
        "firstArgument.expressions.length !== 1"
    );
    expect(ruleSource).toContain("if (!templateExpression) {");
    expect(ruleSource).toContain(
        'prefixQuasi.value.cooked === "Expected a present value, got `" ||'
    );
    expect(ruleSource).toContain(
        'suffixQuasi.value.cooked === "`" || suffixQuasi.value.cooked === ""'
    );
    expect(ruleSource).toContain(
        "sourceCode.getText(templateExpression) ==="
    );
    expect(ruleSource).toContain(
        '(expression.operator !== "==" && expression.operator !== "===")'
    );
    expect(ruleSource).toContain(
        "if (isUndefinedExpression(expression.right)) {"
    );
    expect(ruleSource).toContain('test.operator !== "||"');
    expect(ruleSource).toContain("hasSuggestions: true,");
});

ruleTester.run(
    "prefer-ts-extras-assert-present",
    getPluginRule("prefer-ts-extras-assert-present"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                    },
                    {
                        messageId: "preferTsExtrasAssertPresent",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture nullish guard patterns",
            },
            {
                code: inlineInvalidEqNullCode,
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output: inlineInvalidNullableSuggestionOutputCode,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports loose null comparison guard",
            },
            {
                code: inlineInvalidLogicalCode,
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output: inlineInvalidNullishSuggestionOutputCode,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports strict null-or-undefined logical guard",
            },
            {
                code: inlineInvalidLogicalReversedCode,
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output: inlineInvalidNullishSuggestionOutputCode,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports strict logical guard with reversed operands",
            },
            {
                code: invalidNullOnLeftEqGuardCode,
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output: inlineInvalidNullableSuggestionOutputCode,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports loose null guard with literal on left",
            },
            {
                code: invalidDirectThrowConsequentCode,
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output: inlineInvalidNullableSuggestionOutputCode,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports direct-throw loose null guard",
            },
            {
                code: inlineSuggestableCode,
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output: inlineSuggestableOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "suggests assertPresent() replacement when import is in scope",
            },
            {
                code: inlineSuggestableMixedEqStrictCode,
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output: inlineSuggestableOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports mixed loose/strict nullish logical guards",
            },
            {
                code: inlineSuggestableTemplateWrongPrefixCode,
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output:
                                    inlineInvalidNullableSuggestionOutputWithImportGapCode,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "suggests replacement for throw with non-canonical template prefix",
            },
            {
                code: inlineSuggestableTemplateWrongSuffixCode,
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output:
                                    inlineInvalidNullableSuggestionOutputWithImportGapCode,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "suggests replacement for throw with non-canonical template suffix",
            },
            {
                code: inlineSuggestableTemplateWrongExpressionCode,
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output:
                                    inlineSuggestableTemplateWrongExpressionOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "suggests replacement when template expression differs from guard subject",
            },
            {
                code: inlineAutofixableCanonicalCode,
                errors: [{ messageId: "preferTsExtrasAssertPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes canonical nullish guard throw when assertPresent import is in scope",
                output: inlineAutofixableCanonicalOutput,
            },
            {
                code: inlineAutofixableCanonicalBacktickEnvelopeCode,
                errors: [{ messageId: "preferTsExtrasAssertPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes canonical throw with backtick-wrapped placeholder text",
                output: inlineInvalidNullableSuggestionOutputWithImportGapCode,
            },
            {
                code: inlineAutofixableDirectThrowCanonicalCode,
                errors: [{ messageId: "preferTsExtrasAssertPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes direct canonical throw guard",
                output: inlineInvalidNullableSuggestionOutputWithImportGapCode,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: nonThrowConsequentValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores guard with non-throw consequent",
            },
            {
                code: multiStatementThrowBlockValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores throw block with additional statement",
            },
            {
                code: sameKindLogicalValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores repeated null comparison kind",
            },
            {
                code: alternateBranchValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores guard with explicit else branch",
            },
            {
                code: mismatchedLogicalExpressionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores mismatched logical nullish subjects",
            },
            {
                code: nonNullishLogicalValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-nullish logical comparisons",
            },
            {
                code: nonEqualityTestValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-equality guard expression",
            },
            {
                code: binaryEqWithoutNullValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores equality check that omits nullish literals",
            },
            {
                code: binaryEqAgainstZeroValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores loose equality checks against non-null literals",
            },
            {
                code: logicalWithNonBinaryTermValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores logical guard containing non-binary term",
            },
            {
                code: logicalAndNullishValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores logical-and nullish guards",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-assert-present.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
