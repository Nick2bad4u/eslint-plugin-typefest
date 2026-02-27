import { describe, expect, it, vi } from "vitest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-defined.test` behavior.
 */
import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-is-defined";
const docsDescription =
    "require ts-extras isDefined over inline undefined comparisons outside filter callbacks.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-defined";
const preferTsExtrasIsDefinedMessage =
    "Prefer `isDefined(value)` from `ts-extras` over inline undefined comparisons.";
const preferTsExtrasIsDefinedNegatedMessage =
    "Prefer `!isDefined(value)` from `ts-extras` over inline undefined comparisons.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-defined.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-defined.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureInvalidOutput = `import { isDefined } from "ts-extras";\n${invalidFixtureCode.replace(
    "if (maybeValue !== undefined) {\r\n",
    "if (isDefined(maybeValue)) {\r\n"
)}`;
const fixtureInvalidSecondPassOutput = fixtureInvalidOutput
    .replace(
        "if (undefined !== maybeValue) {\r\n",
        "if (isDefined(maybeValue)) {\r\n"
    )
    .replace(
        'if (typeof maybeValue !== "undefined") {\r\n',
        "if (isDefined(maybeValue)) {\r\n"
    )
    .replace(
        "if (maybeValue === undefined) {\r\n",
        "if (!isDefined(maybeValue)) {\r\n"
    )
    .replace(
        'if ("undefined" === typeof maybeValue) {\r\n',
        "if (!isDefined(maybeValue)) {\r\n"
    );
const inlineFixableDefinedCode = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const hasValue = maybeValue !== undefined;",
].join("\n");
const inlineFixableDefinedOutput = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const hasValue = isDefined(maybeValue);",
].join("\n");
const inlineFixableNegatedCode = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const isMissing = maybeValue === undefined;",
].join("\n");
const inlineFixableNegatedOutput = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const isMissing = !isDefined(maybeValue);",
].join("\n");
const inlineMapCallbackInvalidCode = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const values: Array<string | undefined>;",
    "const mapped = values.map((value) => value !== undefined);",
    "String(mapped.length);",
].join("\n");
const inlineMapCallbackInvalidOutput = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const values: Array<string | undefined>;",
    "const mapped = values.map((value) => isDefined(value));",
    "String(mapped.length);",
].join("\n");
const inlineTypeofReverseInvalidCode = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    'const hasValue = "undefined" !== typeof maybeValue;',
].join("\n");
const inlineTypeofReverseInvalidOutput = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const hasValue = isDefined(maybeValue);",
].join("\n");
const filterArrowCallbackValidCode = [
    "declare const values: Array<string | undefined>;",
    "const onlyDefined = values.filter((value) => value !== undefined);",
    "String(onlyDefined.length);",
].join("\n");
const filterFunctionCallbackValidCode = [
    "declare const values: Array<string | undefined>;",
    "const onlyDefined = values.filter(function (value) {",
    "    return value !== undefined;",
    "});",
    "String(onlyDefined.length);",
].join("\n");
const typeofWithNonTypeofOperatorValidCode = [
    "declare const maybeValue: string | undefined;",
    'const hasValue = void maybeValue !== "undefined";',
    "String(hasValue);",
].join("\n");
const reversedTypeofWithNonTypeofOperatorValidCode = [
    "declare const maybeValue: string | undefined;",
    'const hasValue = "undefined" !== void maybeValue;',
    "String(hasValue);",
].join("\n");
const shadowedUndefinedBindingValidCode = [
    "declare const maybeValue: string | undefined;",
    "const undefined = Symbol('undefined');",
    "const hasValue = maybeValue !== undefined;",
    "String(hasValue);",
].join("\n");
const undeclaredTypeofInequalityValidCode = [
    'const hasValue = typeof maybeUndeclared !== "undefined";',
    "String(hasValue);",
].join("\n");
const undeclaredTypeofEqualityValidCode = [
    'const isMissing = "undefined" === typeof maybeUndeclared;',
    "String(isMissing);",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasIsDefined: preferTsExtrasIsDefinedMessage,
        preferTsExtrasIsDefinedNegated: preferTsExtrasIsDefinedNegatedMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-is-defined metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-is-defined internal create guards", () => {
    it("uses empty filename fallback when context filename is undefined", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
                isTestFilePath: (filePath: string) => filePath.length > 0,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueArgumentFunctionCallFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-defined")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: undefined,
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    getText: () => "maybeValue",
                },
            });

            const binaryExpressionListener = listeners.BinaryExpression;

            expect(binaryExpressionListener).toBeTypeOf("function");

            binaryExpressionListener?.({
                left: {
                    name: "maybeValue",
                    type: "Identifier",
                },
                operator: "!==",
                right: {
                    name: "undefined",
                    type: "Identifier",
                },
                type: "BinaryExpression",
            });

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]?.messageId).toBe("preferTsExtrasIsDefined");
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                { messageId: "preferTsExtrasIsDefined" },
                { messageId: "preferTsExtrasIsDefined" },
                { messageId: "preferTsExtrasIsDefined" },
                { messageId: "preferTsExtrasIsDefinedNegated" },
                { messageId: "preferTsExtrasIsDefinedNegated" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture strict defined and undefined comparisons",
            output: [fixtureInvalidOutput, fixtureInvalidSecondPassOutput],
        },
        {
            code: inlineFixableDefinedCode,
            errors: [{ messageId: "preferTsExtrasIsDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes undefined inequality when isDefined import is in scope",
            output: inlineFixableDefinedOutput,
        },
        {
            code: inlineFixableNegatedCode,
            errors: [{ messageId: "preferTsExtrasIsDefinedNegated" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes undefined equality when isDefined import is in scope",
            output: inlineFixableNegatedOutput,
        },
        {
            code: inlineMapCallbackInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports undefined comparison in non-filter callback",
            output: inlineMapCallbackInvalidOutput,
        },
        {
            code: inlineTypeofReverseInvalidCode,
            errors: [{ messageId: "preferTsExtrasIsDefined" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes reversed typeof undefined inequality",
            output: inlineTypeofReverseInvalidOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: filterArrowCallbackValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined comparison inside filter arrow callback",
        },
        {
            code: filterFunctionCallbackValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined comparison inside filter function callback",
        },
        {
            code: typeofWithNonTypeofOperatorValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores void unary comparison against undefined string literal",
        },
        {
            code: reversedTypeofWithNonTypeofOperatorValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores reversed void unary comparison against undefined string literal",
        },
        {
            code: shadowedUndefinedBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores comparisons against shadowed undefined bindings",
        },
        {
            code: undeclaredTypeofInequalityValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores typeof inequality checks against undeclared identifiers",
        },
        {
            code: undeclaredTypeofEqualityValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores reversed typeof equality checks against undeclared identifiers",
        },
    ],
});
