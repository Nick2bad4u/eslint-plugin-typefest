/**
 * @packageDocumentation
 * Vitest coverage for `configs.test` behavior.
 */
import { describe, expect, it } from "vitest";

import plugin from "../plugin.mjs";

interface FlatConfigLike {
    files?: unknown;
    languageOptions?: Record<string, unknown>;
    name?: unknown;
    plugins?: Record<string, unknown>;
    rules?: Record<string, unknown>;
}

/**
 * GetConfigRules helper.
 *
 * @param configs - Input value for configs.
 * @param configName - Input value for configName.
 *
 * @returns Computed result for `getConfigRules`.
 */

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

/**
 * GetPluginConfigs helper.
 *
 * @param pluginValue - Input value for pluginValue.
 *
 * @returns Computed result for `getPluginConfigs`.
 */

function getPluginConfigs(
    pluginValue: unknown
): null | Record<string, unknown> {
    if (!isObject(pluginValue)) {
        return null;
    }

    const configs = pluginValue["configs"];
    if (!isObject(configs)) {
        return null;
    }

    return configs;
}

/**
 * GetPluginRules helper.
 *
 * @param pluginValue - Input value for pluginValue.
 *
 * @returns Computed result for `getPluginRules`.
 */

function getPluginRules(pluginValue: unknown): null | Record<string, unknown> {
    if (!isObject(pluginValue)) {
        return null;
    }

    const rules = pluginValue["rules"];
    if (!isObject(rules)) {
        return null;
    }

    return rules;
}

/**
 * Check whether is object.
 *
 * @param value - Input value for value.
 *
 * @returns `true` when is object; otherwise `false`.
 */

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

describe("typefest plugin configs", () => {
    const configs = getPluginConfigs(plugin);
    const rules = getPluginRules(plugin);

    it("exports exactly the supported config keys", () => {
        const keys = Object.keys(configs ?? {}).toSorted((left, right) =>
            left.localeCompare(right)
        );

        expect(keys).toStrictEqual([
            "all",
            "minimal",
            "recommended",
            "strict",
            "ts-extras/type-guards",
            "type-fest/types",
        ]);
    });

    it("every exported config registers plugin and TypeScript parser defaults", () => {
        for (const config of Object.values(configs ?? {}) as FlatConfigLike[]) {
            expect(config).toEqual(
                expect.objectContaining({
                    files: ["**/*.{ts,tsx,mts,cts}"],
                    plugins: expect.objectContaining({
                        typefest: expect.anything(),
                    }),
                })
            );

            expect(config.languageOptions).toEqual(
                expect.objectContaining({
                    parser: expect.anything(),
                    parserOptions: expect.objectContaining({
                        ecmaVersion: "latest",
                        sourceType: "module",
                    }),
                })
            );
        }
    });

    it("enables every rule in the all preset", () => {
        const allRules = getConfigRules(configs, "all");

        expect(allRules).toBeDefined();

        for (const ruleId of Object.keys(rules ?? {})) {
            expect(allRules).toHaveProperty(`typefest/${ruleId}`, "error");
        }
    });

    it("keeps minimal ⊂ recommended ⊂ strict ⊂ all", () => {
        const minimalRules = getConfigRules(configs, "minimal") ?? {};
        const recommendedRules = getConfigRules(configs, "recommended") ?? {};
        const strictRules = getConfigRules(configs, "strict") ?? {};
        const allRules = getConfigRules(configs, "all") ?? {};

        for (const ruleName of Object.keys(minimalRules)) {
            expect(recommendedRules).toHaveProperty(ruleName, "error");
        }

        for (const ruleName of Object.keys(recommendedRules)) {
            expect(strictRules).toHaveProperty(ruleName, "error");
        }

        for (const ruleName of Object.keys(strictRules)) {
            expect(allRules).toHaveProperty(ruleName, "error");
        }
    });

    it("keeps type-fest/types focused to type-fest rules", () => {
        const festTypeRulesPreset =
            getConfigRules(configs, "type-fest/types") ?? {};

        for (const ruleName of Object.keys(festTypeRulesPreset)) {
            expect(
                ruleName.startsWith("typefest/prefer-type-fest-")
            ).toBeTruthy();
        }
    });

    it("keeps ts-extras/type-guards focused to ts-extras rules", () => {
        const tsExtrasRules =
            getConfigRules(configs, "ts-extras/type-guards") ?? {};

        for (const ruleName of Object.keys(tsExtrasRules)) {
            expect(
                ruleName.startsWith("typefest/prefer-ts-extras-")
            ).toBeTruthy();
        }
    });

    it("keeps experimental rules strict-only excluded and all-only included", () => {
        const strictRules = getConfigRules(configs, "strict") ?? {};
        const allRules = getConfigRules(configs, "all") ?? {};

        const experimentalRules = [
            "typefest/prefer-ts-extras-array-find",
            "typefest/prefer-ts-extras-array-find-last",
            "typefest/prefer-ts-extras-array-find-last-index",
            "typefest/prefer-ts-extras-is-equal-type",
        ];

        for (const ruleName of experimentalRules) {
            expect(strictRules).not.toHaveProperty(ruleName);
            expect(allRules).toHaveProperty(ruleName, "error");
        }
    });
});
