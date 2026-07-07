/**
 * @packageDocumentation
 * Vitest coverage for `plugin-entry.test` behavior.
 */
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

import { typefestConfigNames } from "../src/_internal/typefest-config-references";
import typefestPlugin from "../src/plugin";

const requireFromTestModule = createRequire(import.meta.url);
const packageJson = requireFromTestModule("../package.json") as {
    version: string;
};
const expectedPluginVersion = packageJson.version;

const criticalRuleNames = [
    "prefer-ts-extras-as-writable",
    "prefer-ts-extras-is-defined",
    "prefer-ts-extras-is-equal-type",
    "prefer-ts-extras-is-present",
    "prefer-ts-extras-not",
    "prefer-ts-extras-safe-cast-to",
    "prefer-type-fest-conditional-pick",
    "prefer-type-fest-if",
    "prefer-type-fest-iterable-element",
    "prefer-type-fest-json-array",
    "prefer-type-fest-json-primitive",
    "prefer-type-fest-keys-of-union",
    "prefer-type-fest-omit-index-signature",
    "prefer-type-fest-require-all-or-none",
    "prefer-type-fest-require-at-least-one",
    "prefer-type-fest-require-exactly-one",
    "prefer-type-fest-require-one-or-none",
    "prefer-type-fest-schema",
    "prefer-type-fest-set-non-nullable",
    "prefer-type-fest-set-optional",
    "prefer-type-fest-set-readonly",
    "prefer-type-fest-set-required",
    "prefer-type-fest-simplify",
    "prefer-type-fest-string-length",
    "prefer-type-fest-tuple-of",
    "prefer-type-fest-unwrap-tagged",
] as const;

const isObjectRecord = (
    value: unknown
): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

type ResolvedRuntimePluginShape = Readonly<{
    configs: Readonly<Record<string, unknown>>;
    meta: Readonly<Record<string, unknown>>;
    processors: Readonly<Record<string, unknown>>;
    rules: Readonly<Record<string, unknown>>;
}>;

function assertObjectRecord(
    value: unknown,
    label: string
): asserts value is Readonly<Record<string, unknown>> {
    if (!isObjectRecord(value)) {
        throw new TypeError(`Expected ${label} to be an object record.`);
    }
}

function getPluginShape(plugin: unknown): ResolvedRuntimePluginShape {
    assertObjectRecord(plugin, "plugin");
    assertObjectRecord(plugin["configs"], "plugin configs");
    assertObjectRecord(plugin["meta"], "plugin metadata");
    assertObjectRecord(plugin["processors"], "plugin processors");
    assertObjectRecord(plugin["rules"], "plugin rules");

    return {
        configs: plugin["configs"],
        meta: plugin["meta"],
        processors: plugin["processors"],
        rules: plugin["rules"],
    };
}

const assertConfigRegistryShape = (
    configs: Readonly<Record<string, unknown>>
): void => {
    for (const configName of typefestConfigNames) {
        expect(Object.hasOwn(configs, configName)).toBe(true);

        assertObjectRecord(configs[configName], `plugin config ${configName}`);
    }
};

const assertRuleRegistryShape = (
    rules: Readonly<Record<string, unknown>>
): void => {
    for (const ruleName of criticalRuleNames) {
        expect(Object.hasOwn(rules, ruleName)).toBe(true);

        assertObjectRecord(rules[ruleName], `plugin rule ${ruleName}`);
    }
};

describe("plugin entry module", () => {
    it("exports default plugin object with rule and config registries", () => {
        expect.hasAssertions();

        const plugin = getPluginShape(typefestPlugin);

        expect(isObjectRecord(plugin.configs)).toBe(true);
        expect(plugin.meta["name"]).toBe("eslint-plugin-typefest");
        expect(plugin.meta["namespace"]).toBe("typefest");
        expect(plugin.meta["version"]).toBe(expectedPluginVersion);
        expect(isObjectRecord(plugin.processors)).toBe(true);
        expect(isObjectRecord(plugin.rules)).toBe(true);
    });

    it("exposes critical presets and latest rule registrations", () => {
        expect.hasAssertions();

        const plugin = getPluginShape(typefestPlugin);

        expect(typefestConfigNames.length).toBeGreaterThan(0);
        expect(criticalRuleNames.length).toBeGreaterThan(0);

        assertConfigRegistryShape(plugin.configs);
        assertRuleRegistryShape(plugin.rules);
    });

    it("exports matching runtime plugin shape from plugin.mjs", async () => {
        expect.hasAssertions();

        const runtimePluginModule = (await import("../plugin.mjs")) as {
            default: unknown;
        };

        const plugin = getPluginShape(runtimePluginModule.default);

        expect(isObjectRecord(plugin.configs)).toBe(true);
        expect(plugin.meta["name"]).toBe("eslint-plugin-typefest");
        expect(plugin.meta["namespace"]).toBe("typefest");
        expect(plugin.meta["version"]).toBe(expectedPluginVersion);
        expect(isObjectRecord(plugin.processors)).toBe(true);
        expect(isObjectRecord(plugin.rules)).toBe(true);
    });

    it("exports matching runtime plugin shape from dist/plugin.cjs", () => {
        expect.hasAssertions();

        const runtimePlugin = requireFromTestModule("../dist/plugin.cjs");

        const plugin = getPluginShape(runtimePlugin);

        expect(isObjectRecord(plugin.configs)).toBe(true);
        expect(plugin.meta["name"]).toBe("eslint-plugin-typefest");
        expect(plugin.meta["namespace"]).toBe("typefest");
        expect(plugin.meta["version"]).toBe(expectedPluginVersion);
        expect(isObjectRecord(plugin.processors)).toBe(true);
        expect(isObjectRecord(plugin.rules)).toBe(true);
    });

    it("resolves package default export through self-reference ESM import", async () => {
        expect.hasAssertions();

        const packageRuntimeModule =
            (await import("eslint-plugin-typefest")) as {
                default: unknown;
            };

        const plugin = getPluginShape(packageRuntimeModule.default);

        expect(isObjectRecord(plugin.configs)).toBe(true);
        expect(plugin.meta["name"]).toBe("eslint-plugin-typefest");
        expect(plugin.meta["namespace"]).toBe("typefest");
        expect(plugin.meta["version"]).toBe(expectedPluginVersion);
        expect(isObjectRecord(plugin.processors)).toBe(true);
        expect(isObjectRecord(plugin.rules)).toBe(true);
    });

    it("resolves package default export through self-reference CJS require", () => {
        expect.hasAssertions();

        const packageRuntimePlugin = requireFromTestModule(
            "eslint-plugin-typefest"
        );

        const plugin = getPluginShape(packageRuntimePlugin);

        expect(isObjectRecord(plugin.configs)).toBe(true);
        expect(plugin.meta["name"]).toBe("eslint-plugin-typefest");
        expect(plugin.meta["namespace"]).toBe("typefest");
        expect(plugin.meta["version"]).toBe(expectedPluginVersion);
        expect(isObjectRecord(plugin.processors)).toBe(true);
        expect(isObjectRecord(plugin.rules)).toBe(true);
    });
});
