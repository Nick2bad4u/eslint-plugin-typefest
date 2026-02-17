import { describe, expect, it } from "vitest";

import typefestPlugin from "../plugin.mjs";

interface FlatConfigLike {
    files?: unknown;
    ignores?: unknown;
    name?: unknown;
    plugins?: Record<string, unknown>;
    rules?: Record<string, unknown>;
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
    const configs = getPluginConfigs(typefestPlugin);

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
});
