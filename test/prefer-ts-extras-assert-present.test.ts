/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import fc from "fast-check";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
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
const emptyConsequentValidCode = [
    "function ensureValue(value: string | null): string | null {",
    "    if (value == null);",
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
const shadowedUndefinedBindingValidCode = [
    "function ensureValue(value: string | null | undefined): string {",
    "    const undefined = 'sentinel';",
    "",
    "    if (value === null || value === undefined) {",
    "        throw new TypeError('Missing value');",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");

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
    "        throw new TypeError(`Unexpected value: \\u0024{value}`);",
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
    "        throw new TypeError(`Expected a present value, got \\u0024{value}!`);",
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
    "        throw new TypeError(`Expected a present value, got \\u0024{fallback}`);",
    "    }",
    "",
    "    return value ?? fallback;",
    "}",
].join("\n");
const inlineSuggestableSpreadArgumentCode = [
    'import { assertPresent } from "ts-extras";',
    "",
    "const messageParts = ['Expected a present value, got `value`'];",
    "",
    "function ensureValue(value: string | null): string {",
    "    if (value == null) {",
    "        throw new TypeError(...messageParts);",
    "    }",
    "",
    "    return value;",
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
    "        throw new TypeError(`Expected a present value, got \\`\\u0024{value}\\``);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const inlineAutofixableDirectThrowCanonicalCode = [
    'import { assertPresent } from "ts-extras";',
    "",
    "function ensureValue(value: string | null): string {",
    "    if (value == null) throw new TypeError(`Expected a present value, got \\u0024{value}`);",
    "",
    "    return value;",
    "}",
].join("\n");
const shadowedTypeErrorSuggestableCode = [
    'import { assertPresent } from "ts-extras";',
    "",
    "class TypeError extends Error {}",
    "",
    "function ensureValue(value: string | null | undefined): string {",
    "    if (value === null || value === undefined) {",
    "        throw new TypeError(`Expected a present value, got \\u0024{value}`);",
    "    }",
    "",
    "    return value;",
    "}",
].join("\n");
const shadowedTypeErrorSuggestableOutput = [
    'import { assertPresent } from "ts-extras";',
    "",
    "class TypeError extends Error {}",
    "",
    "function ensureValue(value: string | null | undefined): string {",
    "    assertPresent(value);",
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
const inlineAutofixableCanonicalUnicodeRichCode = [
    'import { assertPresent } from "ts-extras";',
    "",
    'const glyphBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";',
    "",
    "function ensureValue(候補値: string | null | undefined): string {",
    "    if (候補値 === null || 候補値 === undefined) {",
    "        throw new TypeError(`Expected a present value, got " +
        "$" +
        "{候補値}`);",
    "    }",
    "",
    "    return 候補値;",
    "}",
    "",
    "String(glyphBanner);",
].join("\n");
const inlineAutofixableCanonicalUnicodeRichOutput = [
    'import { assertPresent } from "ts-extras";',
    "",
    'const glyphBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";',
    "",
    "function ensureValue(候補値: string | null | undefined): string {",
    "    assertPresent(候補値);",
    "",
    "    return 候補値;",
    "}",
    "",
    "String(glyphBanner);",
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
const inlineSuggestableSpreadArgumentOutput = [
    'import { assertPresent } from "ts-extras";',
    "",
    "const messageParts = ['Expected a present value, got `value`'];",
    "",
    "function ensureValue(value: string | null): string {",
    "    assertPresent(value);",
    "",
    "    return value;",
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

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type CanonicalGuardTemplateId =
    | "eqNull"
    | "logicalReversedStrict"
    | "logicalStrict"
    | "nullEq";

type NonCanonicalThrowTemplateId =
    | "spreadArgument"
    | "stringLiteral"
    | "suffixMismatch";

const canonicalGuardTemplateIdArbitrary = fc.constantFrom(
    "eqNull",
    "nullEq",
    "logicalStrict",
    "logicalReversedStrict"
);

const nonCanonicalThrowTemplateIdArbitrary = fc.constantFrom(
    "stringLiteral",
    "suffixMismatch",
    "spreadArgument"
);

const variableNameArbitrary = fc.constantFrom("value", "input", "候補値");

const buildPresentGuardText = ({
    guardTemplateId,
    variableName,
}: Readonly<{
    guardTemplateId: CanonicalGuardTemplateId;
    variableName: string;
}>): string => {
    if (guardTemplateId === "eqNull") {
        return `${variableName} == null`;
    }

    if (guardTemplateId === "nullEq") {
        return `null == ${variableName}`;
    }

    if (guardTemplateId === "logicalStrict") {
        return `${variableName} === null || ${variableName} === undefined`;
    }

    return `undefined === ${variableName} || null === ${variableName}`;
};

const buildCanonicalThrowText = (variableName: string): string =>
    `throw new TypeError(\`Expected a present value, got $` +
    `{${variableName}}\`);`;

const buildNonCanonicalThrowText = ({
    throwTemplateId,
    variableName,
}: Readonly<{
    throwTemplateId: NonCanonicalThrowTemplateId;
    variableName: string;
}>): string => {
    if (throwTemplateId === "stringLiteral") {
        return 'throw new TypeError("Missing value");';
    }

    if (throwTemplateId === "suffixMismatch") {
        return (
            `throw new TypeError(\`Expected a present value, got $` +
            `{${variableName}}!\`);`
        );
    }

    return "throw new TypeError(...messageParts);";
};

const buildAssertPresentGuardCode = ({
    guardTemplateId,
    includeUnicodeBanner,
    throwText,
    variableName,
    withSpreadMessageParts,
}: Readonly<{
    guardTemplateId: CanonicalGuardTemplateId;
    includeUnicodeBanner: boolean;
    throwText: string;
    variableName: string;
    withSpreadMessageParts: boolean;
}>): string => {
    const lines = [
        includeUnicodeBanner
            ? 'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
            : "",
        `function ensureValue(${variableName}: string | null | undefined): string {`,
        withSpreadMessageParts
            ? '    const messageParts = ["Missing value"];'
            : "",
        `    if (${buildPresentGuardText({ guardTemplateId, variableName })}) {`,
        `        ${throwText}`,
        "    }",
        "",
        `    return ${variableName};`,
        "}",
        includeUnicodeBanner ? "String(banner);" : "",
    ];

    return lines.filter((line) => line.length > 0).join("\n");
};

const isRangeNode = (
    value: unknown
): value is Readonly<{
    range: readonly [number, number];
}> => {
    if (typeof value !== "object" || value === null || !("range" in value)) {
        return false;
    }

    const candidateRange = value.range;

    if (!Array.isArray(candidateRange) || candidateRange.length !== 2) {
        return false;
    }

    const [start, end] = candidateRange;

    return typeof start === "number" && typeof end === "number";
};

const getSourceTextForNode = ({
    code,
    node,
}: Readonly<{
    code: string;
    node: unknown;
}>): string => {
    if (!isRangeNode(node)) {
        return "";
    }

    return code.slice(node.range[0], node.range[1]);
};

const parseEnsureValueIfStatementFromCode = (
    code: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    ifNode: TSESTree.IfStatement;
}> => {
    const parsed = parser.parseForESLint(code, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.FunctionDeclaration &&
            statement.id?.name === "ensureValue"
        ) {
            for (const bodyStatement of statement.body.body) {
                if (bodyStatement.type === AST_NODE_TYPES.IfStatement) {
                    return {
                        ast: parsed.ast,
                        ifNode: bodyStatement,
                    };
                }
            }
        }
    }

    throw new Error("Expected ensureValue function with an IfStatement guard");
};

type ReplaceTextOnlyFixer = Readonly<{
    replaceText: (node: unknown, text: string) => unknown;
}>;

const assertIsFixFunction: (
    value: unknown
) => asserts value is (fixer: ReplaceTextOnlyFixer) => unknown = (value) => {
    if (typeof value !== "function") {
        throw new TypeError("Expected a fixer function");
    }
};

type ReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
    suggest?: readonly Readonly<
        Readonly<{
            fix?: unknown;
            messageId?: string;
        }>
    >[];
}>;

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

describe("prefer-ts-extras-assert-present source assertions", () => {
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
        expect(ruleSource).toContain("firstArgument.expressions.length !== 1");
        expect(ruleSource).toContain("if (!templateExpression) {");
        expect(ruleSource).toContain(
            'prefixQuasi.value.cooked === "Expected a present value, got `" ||'
        );
        expect(ruleSource).toContain(
            'suffixQuasi.value.cooked === "`" || suffixQuasi.value.cooked === ""'
        );
        expect(ruleSource).toContain(
            "areEquivalentExpressions(templateExpression, guardExpression)"
        );
        expect(ruleSource).toContain(
            '(expression.operator !== "==" && expression.operator !== "===")'
        );
        expect(ruleSource).toContain("isGlobalIdentifierNamed(");
        expect(ruleSource).toContain("isGlobalUndefinedIdentifier(");
        expect(ruleSource).toContain('test.operator !== "||"');
        expect(ruleSource).toContain("hasSuggestions: true,");
    });

    it("handles defensive nullish-guard branches for synthetic AST drift", async () => {
        try {
            vi.resetModules();

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set(["assertPresent"]),
                createSafeValueNodeTextReplacementFix: () => () => [],
            }));

            vi.doMock("../src/_internal/normalize-expression-text.js", () => ({
                areEquivalentExpressions: () => true,
            }));

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalIdentifierNamed: (): boolean => true,
                isGlobalUndefinedIdentifier: (): boolean => true,
                isTestFilePath: (): boolean => false,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-ts-extras-assert-present")) as {
                    default: {
                        create: (context: unknown) => {
                            IfStatement?: (node: unknown) => void;
                        };
                    };
                };

            const sourceText = [
                "function ensureValue(value: string | null): string {",
                "    if (value == null) {",
                "        throw new TypeError(`Expected a present value, got ${" +
                    "value}`);",
                "    }",
                "",
                "    return value;",
                "}",
            ].join("\n");

            const parsed = parser.parseForESLint(sourceText, {
                ecmaVersion: "latest",
                loc: true,
                range: true,
                sourceType: "module",
            });

            const [declaration] = parsed.ast.body;
            if (
                declaration?.type !== AST_NODE_TYPES.FunctionDeclaration ||
                declaration.body.body[0]?.type !== AST_NODE_TYPES.IfStatement
            ) {
                throw new Error(
                    "Expected function declaration containing IfStatement"
                );
            }

            const driftIfStatementNode = declaration.body.body[0];
            const originalConsequent = driftIfStatementNode.consequent;
            let consequentReadCount = 0;

            Object.defineProperty(driftIfStatementNode, "consequent", {
                configurable: true,
                get() {
                    consequentReadCount += 1;

                    if (consequentReadCount === 1) {
                        return originalConsequent;
                    }

                    if (
                        originalConsequent.type !==
                        AST_NODE_TYPES.BlockStatement
                    ) {
                        return originalConsequent;
                    }

                    return {
                        ...originalConsequent,
                        body: [undefined],
                    };
                },
            });

            const report = vi.fn();
            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-ts-extras-assert-present.invalid.ts",
                report,
                sourceCode: {
                    ast: parsed.ast,
                    getText: () => "value",
                },
            });

            listenerMap.IfStatement?.(driftIfStatementNode);

            const parsedCanonical = parser.parseForESLint(sourceText, {
                ecmaVersion: "latest",
                loc: true,
                range: true,
                sourceType: "module",
            });
            const [canonicalDeclaration] = parsedCanonical.ast.body;
            if (
                canonicalDeclaration?.type !==
                    AST_NODE_TYPES.FunctionDeclaration ||
                canonicalDeclaration.body.body[0]?.type !==
                    AST_NODE_TYPES.IfStatement
            ) {
                throw new Error(
                    "Expected function declaration containing canonical IfStatement"
                );
            }

            const canonicalIfStatementNode = canonicalDeclaration.body.body[0];
            if (
                canonicalIfStatementNode.type !== AST_NODE_TYPES.IfStatement ||
                canonicalIfStatementNode.consequent.type !==
                    AST_NODE_TYPES.BlockStatement
            ) {
                throw new Error(
                    "Expected block consequent for canonical mutation test"
                );
            }

            const throwStatement = canonicalIfStatementNode.consequent.body[0];
            if (
                throwStatement?.type !== AST_NODE_TYPES.ThrowStatement ||
                throwStatement.argument.type !== AST_NODE_TYPES.NewExpression
            ) {
                throw new Error(
                    "Expected throw new TypeError(...) in canonical branch"
                );
            }

            const [firstArgument] = throwStatement.argument.arguments;
            if (firstArgument?.type !== AST_NODE_TYPES.TemplateLiteral) {
                throw new Error(
                    "Expected template literal TypeError message argument"
                );
            }

            firstArgument.expressions = [
                undefined,
            ] as unknown as typeof firstArgument.expressions;

            listenerMap.IfStatement?.(canonicalIfStatementNode);

            expect(report).toHaveBeenCalledTimes(2);
            expect(
                (report.mock.calls[0]?.[0] as { suggest?: unknown }).suggest
            ).toBeDefined();
            expect(
                (report.mock.calls[1]?.[0] as { suggest?: unknown }).suggest
            ).toBeDefined();
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/normalize-expression-text.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-assert-present fast-check fix safety", () => {
    it("fast-check: canonical throw guards report direct autofixes that stay parseable", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalIdentifierNamed: (): boolean => true,
                isGlobalUndefinedIdentifier: (): boolean => true,
                isTestFilePath: (): boolean => false,
            }));

            vi.doMock("../src/_internal/normalize-expression-text.js", () => ({
                areEquivalentExpressions: () => true,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set(["assertPresent"]),
                createSafeValueNodeTextReplacementFix:
                    (
                        options: Readonly<{
                            replacementTextFactory: (
                                replacementName: string
                            ) => string;
                            targetNode: unknown;
                        }>
                    ) =>
                    (fixer: ReplaceTextOnlyFixer) =>
                        fixer.replaceText(
                            options.targetNode,
                            options.replacementTextFactory("assertPresent")
                        ),
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-assert-present")) as {
                    default: {
                        create: (context: unknown) => {
                            IfStatement?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    canonicalGuardTemplateIdArbitrary,
                    variableNameArbitrary,
                    fc.boolean(),
                    (guardTemplateId, variableName, includeUnicodeBanner) => {
                        const code = buildAssertPresentGuardCode({
                            guardTemplateId,
                            includeUnicodeBanner,
                            throwText: buildCanonicalThrowText(variableName),
                            variableName,
                            withSpreadMessageParts: false,
                        });
                        const { ast, ifNode } =
                            parseEnsureValueIfStatementFromCode(code);
                        const reportCalls: ReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report(descriptor: ReportDescriptor) {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,

                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.IfStatement?.(ifNode);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferTsExtrasAssertPresent",
                        });
                        expect(reportCalls[0]?.fix).toBeDefined();
                        expect(reportCalls[0]?.suggest).toBeUndefined();

                        const fixFunction: unknown = reportCalls[0]?.fix;
                        assertIsFixFunction(fixFunction);

                        let replacementText = "";

                        fixFunction({
                            replaceText(node, text): unknown {
                                expect(node).toEqual(ifNode);

                                replacementText = text;

                                return text;
                            },
                        });

                        expect(replacementText).toBe(
                            `assertPresent(${variableName});`
                        );

                        const fixedCode =
                            code.slice(0, ifNode.range[0]) +
                            replacementText +
                            code.slice(ifNode.range[1]);

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrowError();
                    }
                ),
                fastCheckRunConfig.runs60
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/normalize-expression-text.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: non-canonical throw guards expose parseable assertPresent suggestions", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalIdentifierNamed: (): boolean => true,
                isGlobalUndefinedIdentifier: (): boolean => true,
                isTestFilePath: (): boolean => false,
            }));

            vi.doMock("../src/_internal/normalize-expression-text.js", () => ({
                areEquivalentExpressions: () => true,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set(["assertPresent"]),
                createSafeValueNodeTextReplacementFix:
                    (
                        options: Readonly<{
                            replacementTextFactory: (
                                replacementName: string
                            ) => string;
                            targetNode: unknown;
                        }>
                    ) =>
                    (fixer: ReplaceTextOnlyFixer) =>
                        fixer.replaceText(
                            options.targetNode,
                            options.replacementTextFactory("assertPresent")
                        ),
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-assert-present")) as {
                    default: {
                        create: (context: unknown) => {
                            IfStatement?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    canonicalGuardTemplateIdArbitrary,
                    nonCanonicalThrowTemplateIdArbitrary,
                    variableNameArbitrary,
                    fc.boolean(),
                    (
                        guardTemplateId,
                        throwTemplateId,
                        variableName,
                        includeUnicodeBanner
                    ) => {
                        const code = buildAssertPresentGuardCode({
                            guardTemplateId,
                            includeUnicodeBanner,
                            throwText: buildNonCanonicalThrowText({
                                throwTemplateId,
                                variableName,
                            }),
                            variableName,
                            withSpreadMessageParts:
                                throwTemplateId === "spreadArgument",
                        });
                        const { ast, ifNode } =
                            parseEnsureValueIfStatementFromCode(code);
                        const reportCalls: ReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report(descriptor: ReportDescriptor) {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.IfStatement?.(ifNode);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            messageId: "preferTsExtrasAssertPresent",
                        });
                        expect(reportCalls[0]?.fix).toBeUndefined();

                        const firstSuggestion = reportCalls[0]?.suggest?.[0];

                        expect(firstSuggestion?.messageId).toBe(
                            "suggestTsExtrasAssertPresent"
                        );
                        expect(firstSuggestion?.fix).toBeDefined();

                        const suggestionFix: unknown = firstSuggestion?.fix;
                        assertIsFixFunction(suggestionFix);

                        let replacementText = "";

                        suggestionFix({
                            replaceText(node, text): unknown {
                                expect(node).toEqual(ifNode);

                                replacementText = text;

                                return text;
                            },
                        });

                        expect(replacementText).toBe(
                            `assertPresent(${variableName});`
                        );

                        const suggestedCode =
                            code.slice(0, ifNode.range[0]) +
                            replacementText +
                            code.slice(ifNode.range[1]);

                        expect(() => {
                            parser.parseForESLint(suggestedCode, parserOptions);
                        }).not.toThrowError();
                    }
                ),
                fastCheckRunConfig.runs70
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/normalize-expression-text.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
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
                code: shadowedTypeErrorSuggestableCode,
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output: shadowedTypeErrorSuggestableOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "suggests replacement when TypeError constructor is shadowed",
            },
            {
                code: inlineSuggestableTemplateWrongPrefixCode,
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output: inlineInvalidNullableSuggestionOutputWithImportGapCode,
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
                                output: inlineInvalidNullableSuggestionOutputWithImportGapCode,
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
                                output: inlineSuggestableTemplateWrongExpressionOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "suggests replacement when template expression differs from guard subject",
            },
            {
                code: inlineSuggestableSpreadArgumentCode,
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output: inlineSuggestableSpreadArgumentOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "suggests replacement when TypeError call spreads message arguments",
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
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output: inlineInvalidNullableSuggestionOutputWithImportGapCode,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "suggests canonical throw with backtick-wrapped placeholder text",
            },
            {
                code: inlineAutofixableDirectThrowCanonicalCode,
                errors: [
                    {
                        messageId: "preferTsExtrasAssertPresent",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasAssertPresent",
                                output: inlineInvalidNullableSuggestionOutputWithImportGapCode,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "suggests direct canonical throw guard",
            },
            {
                code: inlineAutofixableCanonicalUnicodeRichCode,
                errors: [{ messageId: "preferTsExtrasAssertPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes canonical nullish guard in unicode-rich source text",
                output: inlineAutofixableCanonicalUnicodeRichOutput,
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
                code: emptyConsequentValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores nullish guard with an empty consequent",
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
                code: shadowedUndefinedBindingValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores nullish guards that compare against shadowed undefined bindings",
            },
        ],
    }
);
