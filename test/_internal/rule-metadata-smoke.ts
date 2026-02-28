import type { UnknownArray } from "type-fest";

import { describe, expect, it, vi } from "vitest";

/**
 * Minimal shape read from dynamically imported rule modules for metadata
 * assertions.
 */
interface RuleMetadataSnapshot {
    create: (context: unknown) => unknown;
    defaultOptions?: UnknownArray;
    meta?: {
        docs?: {
            description?: string;
            url?: string;
        };
        fixable?: string;
        messages?: Record<string, string>;
        schema?: UnknownArray;
        type?: string;
    };
    name?: string;
}

/**
 * Optional expectation overrides used by shared rule-metadata smoke tests.
 */
interface TypeFestRuleMetadataExpectations {
    readonly defaultOptions?: UnknownArray;
    readonly docsDescription?: string;
    readonly enforceRuleShape?: boolean;
    readonly messages?: Readonly<Record<string, string>>;
    readonly name?: string;
}

/** Canonical documentation URL base used by rule metadata assertions. */
const docsBaseUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules";

/**
 * Import a rule module by id from `src/rules`.
 *
 * @param ruleId - Unqualified rule module id.
 *
 * @returns Imported rule module default export.
 */
const importRuleModule = async (
    ruleId: string
): Promise<{ default: RuleMetadataSnapshot }> => {
    // eslint-disable-next-line no-unsanitized/method -- Rule ids are repository-controlled constants in test files.
    const moduleUnderTest = (await import(
        `../../src/rules/${ruleId}.ts`
    )) as unknown;

    return moduleUnderTest as { default: RuleMetadataSnapshot };
};

/**
 * Registers shared metadata/fallback tests that kill recurring Stryker
 * survivors in rule modules that use `createTypedRule` and the function
 * `context.filename ?? ""`.
 *
 * @param ruleId - Rule module id under `src/rules`.
 * @param expectations - Optional expected metadata overrides.
 */
export const addTypeFestRuleMetadataAndFilenameFallbackTests = (
    ruleId: string,
    expectations: TypeFestRuleMetadataExpectations = {}
): void => {
    const expectedDefaultOptions = expectations.defaultOptions ?? [];
    const expectedDocsUrl = `${docsBaseUrl}/${ruleId}`;
    const expectedRuleName = expectations.name ?? ruleId;

    describe(`${ruleId} metadata`, () => {
        it("exports expected metadata baseline", async () => {
            const metadataRule = (await importRuleModule(ruleId)).default;
            const metadataDefaultOptions =
                "defaultOptions" in metadataRule
                    ? (metadataRule as { defaultOptions?: unknown })
                          .defaultOptions
                    : undefined;
            const expectedDocsDescription =
                expectations.docsDescription ??
                metadataRule.meta?.docs?.description;
            const expectedRuleShape = {
                fixable:
                    expectations.enforceRuleShape === true
                        ? "code"
                        : metadataRule.meta?.fixable,
                schema:
                    expectations.enforceRuleShape === true
                        ? []
                        : metadataRule.meta?.schema,
                type:
                    expectations.enforceRuleShape === true
                        ? "suggestion"
                        : metadataRule.meta?.type,
            } as const;

            expect(metadataRule.name).toBe(expectedRuleName);
            expect(metadataDefaultOptions).toStrictEqual(
                expectedDefaultOptions
            );
            expect(metadataRule.meta?.docs?.url).toBe(expectedDocsUrl);

            expect(metadataRule.meta?.docs?.description).toBe(
                expectedDocsDescription
            );

            for (const [messageId, expectedMessage] of Object.entries(
                expectations.messages ?? {}
            )) {
                expect(metadataRule.meta?.messages?.[messageId]).toBe(
                    expectedMessage
                );
            }

            expect(metadataRule.meta?.fixable).toBe(expectedRuleShape.fixable);
            expect(metadataRule.meta?.schema).toStrictEqual(
                expectedRuleShape.schema
            );
            expect(metadataRule.meta?.type).toBe(expectedRuleShape.type);
        });

        it("declares authored literals before RuleCreator decoration", async () => {
            try {
                vi.resetModules();

                vi.doMock("../../src/_internal/typed-rule.js", () => ({
                    createTypedRule: (definition: unknown): unknown =>
                        definition,
                    isTestFilePath: () => false,
                }));

                const undecoratedRule = (await importRuleModule(ruleId))
                    .default;

                expect(undecoratedRule.defaultOptions).toStrictEqual(
                    expectedDefaultOptions
                );
                expect(undecoratedRule.name).toBe(expectedRuleName);
                expect(undecoratedRule.meta?.docs?.url).toBe(expectedDocsUrl);

                if (expectations.docsDescription !== undefined) {
                    expect(undecoratedRule.meta?.docs?.description).toBe(
                        expectations.docsDescription
                    );
                }

                for (const [messageId, expectedMessage] of Object.entries(
                    expectations.messages ?? {}
                )) {
                    expect(undecoratedRule.meta?.messages?.[messageId]).toBe(
                        expectedMessage
                    );
                }
            } finally {
                vi.doUnmock("../../src/_internal/typed-rule.js");
                vi.resetModules();
            }
        });

        it("falls back to an empty filename before the test-file guard", async () => {
            const capturedPaths: string[] = [];

            try {
                vi.resetModules();

                vi.doMock("../../src/_internal/typed-rule.js", () => ({
                    createTypedRule: (definition: unknown): unknown =>
                        definition,
                    isTestFilePath: (filePath: string): boolean => {
                        capturedPaths.push(filePath);

                        return true;
                    },
                }));

                const undecoratedRule = (await importRuleModule(ruleId))
                    .default;

                undecoratedRule.create({});

                expect(capturedPaths).toStrictEqual([""]);
            } finally {
                vi.doUnmock("../../src/_internal/typed-rule.js");
                vi.resetModules();
            }
        });
    });
};
