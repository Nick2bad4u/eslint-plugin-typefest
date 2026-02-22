import { describe, expect, it, vi } from "vitest";

const loadSourcePlugin = async () => {
    vi.resetModules();
    const pluginModule = await import("../src/plugin");
    return pluginModule.default;
};

type PluginConfig = PluginType["configs"][keyof PluginType["configs"]];
type PluginType = Awaited<ReturnType<typeof loadSourcePlugin>>;

const getRuleEntries = (config: PluginConfig): (readonly [string, unknown])[] =>
    Object.entries(config.rules ?? {});

describe("source plugin config wiring", () => {
    it("builds non-empty layered rule presets from src/plugin", async () => {
        const plugin = await loadSourcePlugin();
        const minimal = plugin.configs.minimal;
        const recommended = plugin.configs.recommended;
        const strict = plugin.configs.strict;
        const all = plugin.configs.all;
        const expectedQualifiedRuleIds = Object.keys(plugin.rules).map(
            (ruleName) => `typefest/${ruleName}`
        );

        expect(getRuleEntries(minimal).length).toBeGreaterThan(0);
        expect(getRuleEntries(recommended).length).toBeGreaterThan(0);
        expect(getRuleEntries(strict).length).toBeGreaterThan(0);
        expect(getRuleEntries(all).length).toBeGreaterThan(0);

        expect(Object.keys(all.rules)).toEqual(
            expect.arrayContaining(expectedQualifiedRuleIds)
        );
        expect(Object.keys(recommended.rules)).toContain(
            "typefest/prefer-type-fest-arrayable"
        );
        expect(Object.keys(recommended.rules)).toContain(
            "typefest/prefer-ts-extras-is-defined"
        );
        expect(Object.keys(strict.rules)).toContain(
            "typefest/prefer-ts-extras-array-at"
        );
        expect(Object.keys(all.rules)).toContain(
            "typefest/prefer-ts-extras-array-find"
        );
        expect(Object.keys(strict.rules)).not.toContain(
            "typefest/prefer-ts-extras-array-find"
        );

        expect(recommended.rules).toHaveProperty(
            "typefest/prefer-type-fest-arrayable",
            "error"
        );
        expect(recommended.rules).toHaveProperty(
            "typefest/prefer-ts-extras-is-defined",
            "error"
        );
        expect(strict.rules).toHaveProperty(
            "typefest/prefer-ts-extras-array-at",
            "error"
        );
        expect(all.rules).toHaveProperty(
            "typefest/prefer-ts-extras-array-find",
            "error"
        );
        expect(strict.rules).not.toHaveProperty(
            "typefest/prefer-ts-extras-array-find"
        );

        expect(plugin.configs.all.name).toBe("typefest:all");
        expect(plugin.configs.minimal.name).toBe("typefest:minimal");
        expect(plugin.configs.recommended.name).toBe("typefest:recommended");
        expect(plugin.configs.strict.name).toBe("typefest:strict");
        expect(plugin.configs["ts-extras/type-guards"].name).toBe(
            "typefest:ts-extras/type-guards"
        );
        expect(plugin.configs["type-fest/types"].name).toBe(
            "typefest:type-fest/types"
        );
        expect(plugin.meta.name).toBe("eslint-plugin-typefest");
    });

    it("registers parser defaults, files, and plugin namespace", async () => {
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
        expect(recommendedConfig.languageOptions?.["parserOptions"]).toEqual({
            ecmaVersion: "latest",
            sourceType: "module",
        });
    });
});
