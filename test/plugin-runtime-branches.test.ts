/**
 * @packageDocumentation
 * Runtime branch coverage tests for plugin bootstrap edge cases.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
    vi.resetModules();
    vi.unmock("node:module");
});

describe("plugin runtime edge branches", () => {
    it("falls back when parser and package version are unavailable", async () => {
        vi.doMock("node:module", () => {
            const mockedRequire = (moduleName: string): unknown => {
                if (moduleName === "@typescript-eslint/parser") {
                    throw new Error("parser unavailable");
                }

                if (moduleName === "../package.json") {
                    return {};
                }

                throw new Error(`Unexpected module request: ${moduleName}`);
            };

            return {
                createRequire: () => mockedRequire,
            };
        });

        const pluginModule = await import("../src/plugin.ts");
        const plugin = pluginModule.default;

        expect(plugin.meta.version).toBe("0.0.0");

        const recommendedConfig = plugin.configs.recommended;
        const languageOptions = recommendedConfig.languageOptions;

        expect(languageOptions?.["parser"]).toBeUndefined();
        expect(languageOptions?.["parserOptions"]).toBeUndefined();
    });

    it("assigns default docs url when a rule docs object omits url", async () => {
        vi.doMock("../src/rules/prefer-ts-extras-array-at.js", () => ({
            default: {
                create: () => ({}),
                defaultOptions: [],
                meta: {
                    docs: {
                        description: "mocked array-at rule docs",
                    },
                    messages: {
                        mockedMessage: "mocked message",
                    },
                    schema: [],
                    type: "suggestion",
                },
            },
        }));

        const pluginModule = await import("../src/plugin.ts");
        const plugin = pluginModule.default;
        const arrayAtRule = plugin.rules["prefer-ts-extras-array-at"];

        expect(arrayAtRule.meta.docs?.url).toBe(
            "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-array-at.md"
        );
    });
});
