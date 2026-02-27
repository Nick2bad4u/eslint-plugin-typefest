import { describe, expect, it, vi } from "vitest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-entries` behavior.
 */
import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-object-entries";
const docsDescription =
    "require ts-extras objectEntries over Object.entries for stronger key/value inference.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-entries";
const preferTsExtrasObjectEntriesMessage =
    "Prefer `objectEntries` from `ts-extras` over `Object.entries(...)` for stronger key and value inference.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-entries.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-entries.invalid.ts";
const inlineInvalidCode = "const pairs = Object.entries({ alpha: 1 });";
const inlineInvalidOutput = [
    'import { objectEntries } from "ts-extras";',
    "const pairs = objectEntries({ alpha: 1 });",
].join("\n");
const inlineFixableCode = [
    'import { objectEntries } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const entries = Object.entries(sample);",
].join("\n");
const inlineFixableOutput = [
    'import { objectEntries } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const entries = objectEntries(sample);",
].join("\n");
const computedAccessValidCode =
    "const pairs = Object['entries']({ alpha: 1 });";
const nonObjectReceiverValidCode = [
    "const helper = {",
    "    entries(value: { alpha: number }): readonly [string, number][] {",
    "        return [['alpha', value.alpha]];",
    "    },",
    "};",
    "const pairs = helper.entries({ alpha: 1 });",
].join("\n");
const wrongPropertyValidCode = "const keys = Object.keys({ alpha: 1 });";
const shadowedObjectBindingValidCode = [
    "const Object = {",
    "    entries(value: { alpha: number }): readonly [string, number][] {",
    "        return [['alpha', value.alpha]];",
    "    },",
    "};",
    "const pairs = Object.entries({ alpha: 1 });",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasObjectEntries: preferTsExtrasObjectEntriesMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-object-entries metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-object-entries internal listener guards", () => {
    it("ignores non-Identifier Object property access", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalIdentifierNamed: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type?: string }>,
                    identifierName: string
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === identifierName,
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueReferenceReplacementFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-object-entries")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                },
            });

            const callExpressionListener = listeners.CallExpression;

            expect(callExpressionListener).toBeTypeOf("function");

            const privatePropertyEntriesCallNode = {
                callee: {
                    computed: false,
                    object: {
                        name: "Object",
                        type: "Identifier",
                    },
                    property: {
                        name: "entries",
                        type: "PrivateIdentifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            callExpressionListener?.(privatePropertyEntriesCallNode);

            expect(reportCalls).toHaveLength(0);
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
            code: readTypedFixture(invalidFixtureName),
            errors: [
                { messageId: "preferTsExtrasObjectEntries" },
                { messageId: "preferTsExtrasObjectEntries" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Object.entries usage",
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasObjectEntries" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct Object.entries call",
            output: inlineInvalidOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasObjectEntries" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Object.entries when objectEntries import is in scope",
            output: inlineFixableOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: computedAccessValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores computed Object.entries member access",
        },
        {
            code: nonObjectReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom non-Object entries method",
        },
        {
            code: wrongPropertyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.keys usage",
        },
        {
            code: shadowedObjectBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.entries call when Object binding is shadowed",
        },
    ],
});
