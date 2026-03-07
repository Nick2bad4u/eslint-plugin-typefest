import type { UnknownArray } from "type-fest";

import { describe, expect, it } from "vitest";

import { recommendedTypeCheckedRuleNames } from "../../src/_internal/type-checked-rule-names";
import { isTypefestConfigReference } from "../../src/_internal/typefest-config-references";

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
            recommended?: boolean;
            typefestConfigs?: readonly string[] | string;
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
 * Narrow unknown values to object records used by runtime module guards.
 */
const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null;

/**
 * Narrow unknown values to booleans for runtime metadata checks.
 */
const isBoolean = (value: unknown): value is boolean =>
    typeof value === "boolean";

/**
 * Guard string rule ids to the plugin's canonical `prefer-*` naming shape.
 */
const isPreferRuleName = (value: string): value is `prefer-${string}` =>
    value.startsWith("prefer-");

/**
 * Guard dynamic import payloads to the expected `{ default: RuleMetadata }`
 * shape.
 */
const isRuleModuleSnapshot = (
    value: unknown
): value is Readonly<{ default: RuleMetadataSnapshot }> => {
    if (!isRecord(value)) {
        return false;
    }

    if (!Object.hasOwn(value, "default")) {
        return false;
    }

    const defaultExport = value["default"];

    return (
        isRecord(defaultExport) && typeof defaultExport["create"] === "function"
    );
};

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
 * Normalize `meta.docs.typefestConfigs` into a reference list suitable for
 * assertion.
 */
const getTypefestConfigReferenceCandidates = (
    typefestConfigs: readonly string[] | string | undefined
): readonly string[] => {
    if (typeof typefestConfigs === "string") {
        return [typefestConfigs];
    }

    if (!Array.isArray(typefestConfigs)) {
        return [];
    }

    const references: string[] = [];

    for (const candidate of typefestConfigs) {
        if (typeof candidate === "string") {
            references.push(candidate);
        }
    }

    return references;
};

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
    const moduleUnderTest: unknown = await import(
        `../../src/rules/${ruleId}.ts`
    );

    if (!isRuleModuleSnapshot(moduleUnderTest)) {
        throw new TypeError(
            `Rule module '${ruleId}' does not export a valid default rule object.`
        );
    }

    return moduleUnderTest;
};

/**
 * Registers shared metadata smoke tests that kill recurring Stryker survivors
 * in rule modules that use `createTypedRule`.
 *
 * @param ruleId - Rule module id under `src/rules`.
 * @param expectations - Optional expected metadata overrides.
 */
export const addTypeFestRuleMetadataSmokeTests = (
    ruleId: string,
    expectations: TypeFestRuleMetadataExpectations = {}
): void => {
    const expectedDefaultOptions = expectations.defaultOptions ?? [];
    const expectedDocsUrl = `${docsBaseUrl}/${ruleId}`;
    const expectedRuleName = expectations.name ?? ruleId;

    describe(`${ruleId} metadata`, () => {
        it("exports expected metadata baseline", async () => {
            const metadataRule = (await importRuleModule(ruleId)).default;
            const metadataDefaultOptions = metadataRule.defaultOptions;
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

            expect(
                isBoolean(metadataRule.meta?.docs?.recommended)
            ).toBeTruthy();

            const presetReferences = getTypefestConfigReferenceCandidates(
                metadataRule.meta?.docs?.typefestConfigs
            );

            expect(presetReferences.length).toBeGreaterThan(0);

            for (const presetReference of presetReferences) {
                expect(isTypefestConfigReference(presetReference)).toBeTruthy();
            }

            expect(metadataRule.meta?.docs?.recommended).toBe(
                presetReferences.includes("typefest.configs.recommended")
            );

            const isRecommendedTypeCheckedRule =
                isPreferRuleName(ruleId) &&
                recommendedTypeCheckedRuleNames.has(ruleId);

            expect(
                presetReferences.includes(
                    "typefest.configs.recommended-type-checked"
                )
            ).toBe(isRecommendedTypeCheckedRule);
            expect(
                isRecommendedTypeCheckedRule &&
                    presetReferences.includes("typefest.configs.recommended")
            ).toBeFalsy();
            expect(
                isRecommendedTypeCheckedRule &&
                    metadataRule.meta?.docs?.recommended
            ).toBeFalsy();

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
    });
};
