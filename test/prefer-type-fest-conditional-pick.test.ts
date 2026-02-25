import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-conditional-pick.test` behavior.
 */
import { describe, expect, it, vi } from "vitest";

import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-conditional-pick.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-conditional-pick.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-conditional-pick.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'import type { PickByTypes } from "type-aliases";\r\n',
        'import type { PickByTypes } from "type-aliases";\nimport type { ConditionalPick } from "type-fest";\r\n'
    )
    .replace("PickByTypes<", "ConditionalPick<");
const inlineFixableInvalidCode = [
    'import type { PickByTypes } from "type-aliases";',
    'import type { ConditionalPick } from "type-fest";',
    "",
    "type Input = PickByTypes<{ a: string; b: number }, string>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Input = PickByTypes<{ a: string; b: number }, string>;",
    "type Input = ConditionalPick<{ a: string; b: number }, string>;"
);

interface ConditionalPickRuleMetadataSnapshot {
    create: (context: unknown) => unknown;
    defaultOptions?: Readonly<UnknownArray>;
    meta?: {
        docs?: {
            description?: string;
            url?: string;
        };
        messages?: Record<string, string>;
    };
    name?: string;
}

const loadConditionalPickRuleMetadata =
    async (): Promise<ConditionalPickRuleMetadataSnapshot> => {
        vi.resetModules();

        const moduleUnderTest =
            await import("../src/rules/prefer-type-fest-conditional-pick");

        return moduleUnderTest.default as ConditionalPickRuleMetadataSnapshot;
    };

describe("prefer-type-fest-conditional-pick metadata", () => {
    it("exports expected metadata", async () => {
        const metadataRule = await loadConditionalPickRuleMetadata();
        const metadataDefaultOptions =
            "defaultOptions" in metadataRule
                ? (metadataRule as { defaultOptions?: unknown }).defaultOptions
                : undefined;

        expect(metadataRule.name).toBe("prefer-type-fest-conditional-pick");
        expect(metadataDefaultOptions).toStrictEqual([]);
        expect(metadataRule.meta?.docs?.description).toBe(
            "require TypeFest ConditionalPick over imported aliases such as PickByTypes."
        );
        expect(metadataRule.meta?.docs?.url).toBe(
            "https://eslint-plugin-typefest.nick2bad4u.com/rules/prefer-type-fest-conditional-pick"
        );
        expect(metadataRule.meta?.messages?.["preferConditionalPick"]).toBe(
            "Prefer `{{replacement}}` from type-fest to pick keys whose values match a condition instead of legacy alias `{{alias}}`."
        );
    });

    it("declares authored docs url literal before RuleCreator decoration", async () => {
        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: () => false,
            }));

            const undecoratedModule =
                (await import("../src/rules/prefer-type-fest-conditional-pick")) as {
                    default: ConditionalPickRuleMetadataSnapshot;
                };

            expect(undecoratedModule.default.meta?.docs?.url).toBe(
                "https://eslint-plugin-typefest.nick2bad4u.com/rules/prefer-type-fest-conditional-pick"
            );
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("falls back to an empty filename before the test-file guard", async () => {
        const capturedPaths: string[] = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/imported-type-aliases.js", () => ({
                collectDirectNamedImportsFromSource: () => new Set<string>(),
                collectImportedTypeAliasMatches: () =>
                    new Map<
                        string,
                        { importedName: string; replacementName: string }
                    >(),
                createSafeTypeReferenceReplacementFix: () => undefined,
            }));

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: (filePath: string): boolean => {
                    capturedPaths.push(filePath);

                    return true;
                },
            }));

            const undecoratedModule =
                (await import("../src/rules/prefer-type-fest-conditional-pick")) as {
                    default: ConditionalPickRuleMetadataSnapshot;
                };

            undecoratedModule.default.create({});

            expect(capturedPaths).toStrictEqual([""]);
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(
    "prefer-type-fest-conditional-pick",
    getPluginRule("prefer-type-fest-conditional-pick"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "PickByTypes",
                            replacement: "ConditionalPick",
                        },
                        messageId: "preferConditionalPick",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture PickByTypes alias usage",
                output: fixtureFixableOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "PickByTypes",
                            replacement: "ConditionalPick",
                        },
                        messageId: "preferConditionalPick",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline PickByTypes alias import",
                output: inlineFixableOutputCode,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: readTypedFixture(namespaceValidFixtureName),
                filename: typedFixturePath(namespaceValidFixtureName),
                name: "accepts namespace-qualified type-fest references",
            },
        ],
    }
);
