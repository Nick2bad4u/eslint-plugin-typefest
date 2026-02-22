import { describe, expect, it, vi } from "vitest";

interface RuleMetadataSnapshot {
    create: (context: unknown) => unknown;
    defaultOptions?: readonly unknown[];
    meta?: {
        docs?: {
            description?: string;
            url?: string;
        };
        fixable?: string;
        messages?: Record<string, string>;
        schema?: readonly unknown[];
        type?: string;
    };
    name?: string;
}

interface TypeFestRuleMetadataExpectations {
    readonly docsDescription?: string;
    readonly enforceRuleShape?: boolean;
    readonly messages?: Readonly<Record<string, string>>;
}

const docsBaseUrl =
    "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules";

const importRuleModule = async (
    ruleId: string
): Promise<{ default: RuleMetadataSnapshot }> => {
    const moduleUnderTest = (await import(
        `../../src/rules/${ruleId}.ts`
    )) as unknown;

    return moduleUnderTest as { default: RuleMetadataSnapshot };
};

/**
 * Registers shared metadata/fallback tests that kill recurring Stryker survivors
 * in rule modules that use `createTypedRule` + `context.filename ?? ""`.
 */
export const addTypeFestRuleMetadataAndFilenameFallbackTests = (
    ruleId: string,
    expectations: TypeFestRuleMetadataExpectations = {}
): void => {
    const expectedDocsUrl = `${docsBaseUrl}/${ruleId}.md`;

    describe(`${ruleId} metadata`, () => {
        it("exports expected metadata baseline", async () => {
            const metadataRule = (await importRuleModule(ruleId)).default;
            const metadataDefaultOptions =
                "defaultOptions" in metadataRule
                    ? (metadataRule as { defaultOptions?: unknown })
                          .defaultOptions
                    : undefined;

            expect(metadataRule.name).toBe(ruleId);
            expect(metadataDefaultOptions).toStrictEqual([]);
            expect(metadataRule.meta?.docs?.url).toBe(expectedDocsUrl);

            if (expectations.docsDescription !== undefined) {
                expect(metadataRule.meta?.docs?.description).toBe(
                    expectations.docsDescription
                );
            }

            if (expectations.messages !== undefined) {
                for (const [messageId, expectedMessage] of Object.entries(
                    expectations.messages
                )) {
                    expect(metadataRule.meta?.messages?.[messageId]).toBe(
                        expectedMessage
                    );
                }
            }

            if (expectations.enforceRuleShape) {
                expect(metadataRule.meta?.fixable).toBe("code");
                expect(metadataRule.meta?.schema).toStrictEqual([]);
                expect(metadataRule.meta?.type).toBe("suggestion");
            }
        });

        it("declares authored docs url literal before RuleCreator decoration", async () => {
            try {
                vi.resetModules();

                vi.doMock("../../src/_internal/typed-rule.js", () => ({
                    createTypedRule: (definition: unknown): unknown =>
                        definition,
                    isTestFilePath: () => false,
                }));

                const undecoratedRule = (await importRuleModule(ruleId)).default;

                expect(undecoratedRule.meta?.docs?.url).toBe(expectedDocsUrl);
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

                const undecoratedRule = (await importRuleModule(ruleId)).default;

                undecoratedRule.create({});

                expect(capturedPaths).toStrictEqual([""]);
            } finally {
                vi.doUnmock("../../src/_internal/typed-rule.js");
                vi.resetModules();
            }
        });
    });
};
