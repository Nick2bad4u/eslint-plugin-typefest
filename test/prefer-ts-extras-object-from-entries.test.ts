import { describe, expect, it, vi } from "vitest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-from-entries.test` behavior.
 */
import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-object-from-entries";
const docsDescription =
    "require ts-extras objectFromEntries over Object.fromEntries for stronger key/value inference.";
const docsUrl =
    "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-object-from-entries.md";
const preferTsExtrasObjectFromEntriesMessage =
    "Prefer `objectFromEntries` from `ts-extras` over `Object.fromEntries(...)` for stronger key and value inference.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-from-entries.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-from-entries.invalid.ts";
const inlineInvalidCode =
    "const value = Object.fromEntries([['alpha', 1]] as const);";
const inlineFixableCode = [
    'import { objectFromEntries } from "ts-extras";',
    "",
    "const entries = [['alpha', 1]] as const;",
    "const value = Object.fromEntries(entries);",
].join("\n");
const inlineFixableOutput = [
    'import { objectFromEntries } from "ts-extras";',
    "",
    "const entries = [['alpha', 1]] as const;",
    "const value = objectFromEntries(entries);",
].join("\n");
const inlineInvalidOutputCode = [
    'import { objectFromEntries } from "ts-extras";',
    "const value = objectFromEntries([['alpha', 1]] as const);",
].join("\n");
const computedAccessValidCode =
    "const value = Object['fromEntries']([['alpha', 1]] as const);";
const nonObjectReceiverValidCode = [
    "const helper = {",
    "    fromEntries(entries: ReadonlyArray<readonly [string, number]>): { alpha: number } {",
    "        return { alpha: entries[0][1] };",
    "    },",
    "};",
    "const value = helper.fromEntries([['alpha', 1]] as const);",
].join("\n");
const wrongPropertyValidCode =
    "const value = Object.entries({ alpha: 1 } as const);";

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasObjectFromEntries: preferTsExtrasObjectFromEntriesMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-object-from-entries metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-object-from-entries internal listener guards", () => {
    it("ignores non-Identifier Object property access", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueReferenceReplacementFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-object-from-entries")) as {
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

            const privatePropertyFromEntriesCallNode = {
                callee: {
                    computed: false,
                    object: {
                        name: "Object",
                        type: "Identifier",
                    },
                    property: {
                        name: "fromEntries",
                        type: "PrivateIdentifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            callExpressionListener?.(privatePropertyFromEntriesCallNode);

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
                {
                    messageId: "preferTsExtrasObjectFromEntries",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Object.fromEntries usage",
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasObjectFromEntries" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct Object.fromEntries call",
            output: inlineInvalidOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasObjectFromEntries" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Object.fromEntries when objectFromEntries import is in scope",
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
            name: "ignores computed Object.fromEntries member access",
        },
        {
            code: nonObjectReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom non-Object fromEntries method",
        },
        {
            code: wrongPropertyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.entries usage",
        },
    ],
});
