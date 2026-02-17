import { describe, expect, it } from "vitest";

import plugin from "../plugin.mjs";

interface FlatConfigLike {
    files?: unknown;
    ignores?: unknown;
    name?: unknown;
    plugins?: Record<string, unknown>;
    rules?: Record<string, unknown>;
}

function getConfigRules(
    configs: null | Record<string, unknown>,
    configName: string
): null | Record<string, unknown> {
    const config = configs?.[configName];

    if (!isObject(config)) {
        return null;
    }

    const rules = config["rules"];
    if (!isObject(rules)) {
        return null;
    }

    return rules;
}

function getPluginConfigs(plugin: unknown): null | Record<string, unknown> {
    if (!isObject(plugin)) {
        return null;
    }

    const configsKey = "configs" as const;
    const configs = plugin[configsKey];
    if (!isObject(configs)) {
        return null;
    }

    return configs;
}

function getPluginRules(plugin: unknown): null | Record<string, unknown> {
    if (!isObject(plugin)) {
        return null;
    }

    const rules = plugin["rules"];
    if (!isObject(rules)) {
        return null;
    }

    return rules;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/**
 * Lightweight shape checks for `plugin.configs.*`.
 *
 * @remarks
 * These tests exist to prevent accidental regressions when we refactor the
 * internal plugin (for example: returning the wrong type for array-based
 * configs, or forgetting to register the plugin on a config item).
 */
describe("typefest plugin configs", () => {
    const configs = getPluginConfigs(plugin);
    const rules = getPluginRules(plugin);

    it("exports the expected config keys", () => {
        expect(configs).toBeDefined();

        const keys = Object.keys(configs ?? {});

        // Keep this intentionally narrow: we only assert the presets we promise
        // To consumers.
        expect(keys).toEqual(
            expect.arrayContaining([
                "all",
                "assertive",
                "complete",
                "core",
                "default",
                "minimal",
                "recommended",
                "runtime",
                "safe",
                "strict",
                "ts-extras",
                "ts-extras-experimental",
                "ts-extras-safe",
                "type-fest",
                "flat/assertive",
                "flat/all",
                "flat/complete",
                "flat/core",
                "flat/default",
                "flat/minimal",
                "flat/recommended",
                "flat/runtime",
                "flat/safe",
                "flat/strict",
                "flat/ts-extras",
                "flat/ts-extras-experimental",
                "flat/ts-extras-safe",
                "flat/type-fest",
            ])
        );
    });

    it("every exported config registers the plugin as 'typefest'", () => {
        for (const config of Object.values(configs ?? {}) as FlatConfigLike[]) {
            expect(Array.isArray(config)).toBeFalsy();

            expect(config).toEqual(
                expect.objectContaining({
                    plugins: expect.objectContaining({
                        typefest: expect.anything(),
                    }),
                })
            );
        }
    });

    it("maps all exported rules to all/type-fest/ts-extras presets consistently", () => {
        expect(rules).toBeDefined();

        const allRules = getConfigRules(configs, "all");
        const rulesForTypeFest = getConfigRules(configs, "type-fest");
        const rulesForTsExtras = getConfigRules(configs, "ts-extras");
        const rulesForTsExtrasExperimental = getConfigRules(
            configs,
            "ts-extras-experimental"
        );

        expect(allRules).toBeDefined();
        expect(rulesForTypeFest).toBeDefined();
        expect(rulesForTsExtras).toBeDefined();
        expect(rulesForTsExtrasExperimental).toBeDefined();

        for (const ruleId of Object.keys(rules ?? {})) {
            const pluginRuleName = `typefest/${ruleId}`;

            expect(allRules).toHaveProperty(pluginRuleName, "error");

            if (ruleId.startsWith("prefer-type-fest-")) {
                expect(rulesForTypeFest).toHaveProperty(
                    pluginRuleName,
                    "error"
                );
                expect(rulesForTsExtras).not.toHaveProperty(pluginRuleName);
            }

            if (ruleId.startsWith("prefer-ts-extras-")) {
                const isInStableTsExtras =
                    rulesForTsExtras?.[pluginRuleName] === "error";
                const isInExperimentalTsExtras =
                    rulesForTsExtrasExperimental?.[pluginRuleName] === "error";

                expect(
                    isInStableTsExtras || isInExperimentalTsExtras
                ).toBeTruthy();
                expect(rulesForTypeFest).not.toHaveProperty(pluginRuleName);
            }
        }
    });

    it("keeps experimental ts-extras rules out of safe and standard ts-extras tiers", () => {
        const safeRules = getConfigRules(configs, "safe");
        const tsExtrasRules = getConfigRules(configs, "ts-extras");
        const tsExtrasExperimentalRules = getConfigRules(
            configs,
            "ts-extras-experimental"
        );

        expect(safeRules).toBeDefined();
        expect(tsExtrasRules).toBeDefined();
        expect(tsExtrasExperimentalRules).toBeDefined();

        expect(safeRules).not.toHaveProperty(
            "typefest/prefer-ts-extras-array-find"
        );
        expect(safeRules).not.toHaveProperty(
            "typefest/prefer-ts-extras-array-find-last"
        );
        expect(safeRules).not.toHaveProperty(
            "typefest/prefer-ts-extras-array-find-last-index"
        );
        expect(safeRules).not.toHaveProperty(
            "typefest/prefer-ts-extras-is-equal-type"
        );
        expect(tsExtrasRules).not.toHaveProperty(
            "typefest/prefer-ts-extras-array-find"
        );
        expect(tsExtrasRules).not.toHaveProperty(
            "typefest/prefer-ts-extras-array-find-last"
        );
        expect(tsExtrasRules).not.toHaveProperty(
            "typefest/prefer-ts-extras-array-find-last-index"
        );
        expect(tsExtrasRules).not.toHaveProperty(
            "typefest/prefer-ts-extras-is-equal-type"
        );

        expect(tsExtrasExperimentalRules).toHaveProperty(
            "typefest/prefer-ts-extras-array-find",
            "error"
        );
        expect(tsExtrasExperimentalRules).toHaveProperty(
            "typefest/prefer-ts-extras-array-find-last",
            "error"
        );
        expect(tsExtrasExperimentalRules).toHaveProperty(
            "typefest/prefer-ts-extras-array-find-last-index",
            "error"
        );
        expect(tsExtrasExperimentalRules).toHaveProperty(
            "typefest/prefer-ts-extras-is-equal-type",
            "error"
        );
    });

    it("keeps established runtime helpers in safe and ts-extras-safe tiers", () => {
        const safeRules = getConfigRules(configs, "safe");
        const tsExtrasSafeRules = getConfigRules(configs, "ts-extras-safe");

        expect(safeRules).toBeDefined();
        expect(tsExtrasSafeRules).toBeDefined();

        expect(safeRules).toHaveProperty(
            "typefest/prefer-ts-extras-as-writable",
            "error"
        );
        expect(safeRules).toHaveProperty(
            "typefest/prefer-ts-extras-safe-cast-to",
            "error"
        );
        expect(safeRules).toHaveProperty(
            "typefest/prefer-ts-extras-is-defined",
            "error"
        );
        expect(safeRules).toHaveProperty(
            "typefest/prefer-ts-extras-is-present",
            "error"
        );

        expect(tsExtrasSafeRules).toHaveProperty(
            "typefest/prefer-ts-extras-as-writable",
            "error"
        );
        expect(tsExtrasSafeRules).toHaveProperty(
            "typefest/prefer-ts-extras-safe-cast-to",
            "error"
        );
        expect(tsExtrasSafeRules).toHaveProperty(
            "typefest/prefer-ts-extras-is-defined",
            "error"
        );
        expect(tsExtrasSafeRules).toHaveProperty(
            "typefest/prefer-ts-extras-is-present",
            "error"
        );
    });
});
