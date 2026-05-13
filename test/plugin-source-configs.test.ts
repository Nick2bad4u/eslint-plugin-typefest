/**
 * @packageDocumentation
 * Integration coverage for source-level plugin preset wiring.
 */
import type { AsyncReturnType } from "type-fest";

import { describe, expect, it, vi } from "vitest";

import {
    typefestConfigMetadataByName,
    typefestConfigNames,
} from "../src/_internal/typefest-config-references";

/** Import `src/plugin` fresh for each assertion set. */
const loadSourcePlugin = async () => {
    vi.resetModules();
    const pluginModule = await import("../src/plugin");
    return pluginModule.default;
};

/** Plugin config object shape inferred from the loaded source plugin. */
type PluginConfig = PluginType["configs"][keyof PluginType["configs"]];
/** Resolved plugin module type for async source import helper. */
type PluginType = AsyncReturnType<typeof loadSourcePlugin>;

/** Convert a preset rules object into deterministic `[ruleId, level]` entries. */
const getRuleEntries = (
    config: Readonly<PluginConfig>
): (readonly [string, unknown])[] => Object.entries(config.rules ?? {});

describe("source plugin config wiring", () => {
    it("builds non-empty layered rule presets from src/plugin", async () => {
        expect.hasAssertions();

        const plugin = await loadSourcePlugin();
        const minimal = plugin.configs.minimal;
        const recommended = plugin.configs.recommended;
        const recommendedTypeChecked =
            plugin.configs["recommended-type-checked"];
        const strict = plugin.configs.strict;
        const all = plugin.configs.all;
        const experimental = plugin.configs.experimental;
        const expectedQualifiedRuleIds = Object.keys(plugin.rules).map(
            (ruleName) => `typefest/${ruleName}`
        );
        const recommendedRuleIds = Object.keys(recommended.rules);
        const recommendedTypeCheckedRuleIds = Object.keys(
            recommendedTypeChecked.rules
        );
        const strictRuleIds = Object.keys(strict.rules);
        const allRuleIds = Object.keys(all.rules);
        const experimentalRuleIds = Object.keys(experimental.rules);

        expect(getRuleEntries(minimal).length).toBeGreaterThan(0);
        expect(getRuleEntries(recommended).length).toBeGreaterThan(0);
        expect(getRuleEntries(recommendedTypeChecked).length).toBeGreaterThan(
            0
        );
        expect(getRuleEntries(strict).length).toBeGreaterThan(0);
        expect(getRuleEntries(all).length).toBeGreaterThan(0);
        expect(getRuleEntries(experimental).length).toBeGreaterThan(0);

        expect(experimentalRuleIds).toStrictEqual(
            expect.arrayContaining(expectedQualifiedRuleIds)
        );
        expect(recommendedRuleIds).toStrictEqual(
            expect.arrayContaining([
                "typefest/prefer-type-fest-arrayable",
                "typefest/prefer-ts-extras-is-defined",
            ])
        );
        expect(recommendedRuleIds).not.toContain(
            "typefest/prefer-ts-extras-set-has"
        );
        expect(recommendedTypeCheckedRuleIds).toContain(
            "typefest/prefer-ts-extras-set-has"
        );
        expect(strictRuleIds).toStrictEqual(
            expect.arrayContaining([
                "typefest/prefer-ts-extras-set-has",
                "typefest/prefer-ts-extras-array-at",
            ])
        );
        expect(allRuleIds).toContain("typefest/prefer-ts-extras-is-equal-type");
        expect(experimentalRuleIds).toStrictEqual(
            expect.arrayContaining([
                "typefest/prefer-ts-extras-object-map-values",
                "typefest/prefer-type-fest-conditional-except",
                "typefest/prefer-type-fest-merge",
                "typefest/prefer-type-fest-asyncify",
                "typefest/prefer-type-fest-conditional-keys",
                "typefest/prefer-type-fest-distributed-omit",
                "typefest/prefer-type-fest-distributed-pick",
                "typefest/prefer-type-fest-pick-index-signature",
                "typefest/prefer-type-fest-set-return-type",
                "typefest/prefer-type-fest-stringified",
                "typefest/prefer-type-fest-union-to-intersection",
            ])
        );
        expect(strictRuleIds).not.toContain(
            "typefest/prefer-ts-extras-is-equal-type"
        );
        expect(allRuleIds).not.toContain(
            "typefest/prefer-ts-extras-object-map-values"
        );

        const expectedErrorRulesByConfig: Readonly<
            Record<(typeof typefestConfigNames)[number], readonly string[]>
        > = {
            all: ["typefest/prefer-ts-extras-is-equal-type"],
            experimental: [
                "typefest/prefer-ts-extras-object-map-values",
                "typefest/prefer-type-fest-conditional-except",
                "typefest/prefer-type-fest-merge",
                "typefest/prefer-type-fest-asyncify",
                "typefest/prefer-type-fest-conditional-keys",
                "typefest/prefer-type-fest-distributed-omit",
                "typefest/prefer-type-fest-distributed-pick",
                "typefest/prefer-type-fest-pick-index-signature",
                "typefest/prefer-type-fest-set-return-type",
                "typefest/prefer-type-fest-stringified",
                "typefest/prefer-type-fest-union-to-intersection",
            ],
            minimal: [],
            recommended: [
                "typefest/prefer-type-fest-arrayable",
                "typefest/prefer-ts-extras-is-defined",
            ],
            "recommended-type-checked": ["typefest/prefer-ts-extras-set-has"],
            strict: ["typefest/prefer-ts-extras-array-at"],
            "ts-extras/type-guards": [],
            "type-fest/types": [],
        };

        for (const configName of typefestConfigNames) {
            const ruleIds = expectedErrorRulesByConfig[configName];
            const rulesRecord = plugin.configs[configName].rules;

            for (const ruleId of ruleIds) {
                expect(rulesRecord).toHaveProperty(ruleId, "error");
            }
        }

        expect(strict.rules).not.toHaveProperty(
            "typefest/prefer-ts-extras-is-equal-type"
        );
        expect(all.rules).not.toHaveProperty(
            "typefest/prefer-ts-extras-object-map-values"
        );

        for (const configName of typefestConfigNames) {
            expect(plugin.configs[configName].name).toBe(
                typefestConfigMetadataByName[configName].presetName
            );
        }

        expect(plugin.meta.name).toBe("eslint-plugin-typefest");
    });

    it("registers parser defaults, files, and plugin namespace", async () => {
        expect.hasAssertions();

        const plugin = await loadSourcePlugin();
        const recommendedConfig = plugin.configs.recommended;

        expect(recommendedConfig.files).toStrictEqual([
            "**/*.{ts,tsx,mts,cts}",
        ]);
        expect(recommendedConfig.plugins).toHaveProperty("typefest");
        expect(recommendedConfig.plugins?.["typefest"]).toHaveProperty("rules");
        expect(recommendedConfig.languageOptions).toHaveProperty("parser");
        expect(recommendedConfig.languageOptions).toHaveProperty(
            "parserOptions"
        );
        expect(
            recommendedConfig.languageOptions?.["parserOptions"]
        ).toStrictEqual({
            ecmaVersion: "latest",
            sourceType: "module",
        });

        for (const configName of typefestConfigNames) {
            const parserOptions =
                plugin.configs[configName].languageOptions?.["parserOptions"];

            expect(parserOptions).toStrictEqual(
                expect.objectContaining({
                    ecmaVersion: "latest",
                    sourceType: "module",
                })
            );

            const hasProjectServiceEnabled =
                typeof parserOptions === "object" &&
                parserOptions !== null &&
                "projectService" in parserOptions &&
                Reflect.get(parserOptions, "projectService") === true;

            expect(hasProjectServiceEnabled).toBe(
                typefestConfigMetadataByName[configName].requiresTypeChecking
            );
        }
    });
});
