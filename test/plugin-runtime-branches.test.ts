/**
 * @packageDocumentation
 * Runtime branch coverage tests for plugin bootstrap edge cases.
 */
import { describe, expect, it, vi } from "vitest";

const resetRuntimeMocks = (): void => {
    vi.resetModules();
    vi.doUnmock("node:module");
    vi.doUnmock("../src/rules/prefer-ts-extras-array-at.js");
};

describe("plugin runtime edge branches", () => {
    it("falls back when parser and package version are unavailable", async () => {
        try {
            vi.doMock("node:module", () => {
                const mockedRequire = (moduleName: string): unknown => {
                    if (moduleName === "@typescript-eslint/parser") {
                        const moduleNotFoundError = new Error(
                            "Cannot find module '@typescript-eslint/parser'"
                        ) as Error & {
                            code: string;
                        };

                        moduleNotFoundError.code = "MODULE_NOT_FOUND";

                        throw moduleNotFoundError;
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

            const pluginModule = await import("../src/plugin");
            const plugin = pluginModule.default;

            expect(plugin.meta.version).toBe("0.0.0");

            for (const presetConfig of Object.values(plugin.configs)) {
                const languageOptions = presetConfig.languageOptions;

                expect(languageOptions?.["parser"]).toBeUndefined();
                expect(languageOptions?.["parserOptions"]).toBeUndefined();
            }
        } finally {
            resetRuntimeMocks();
        }
    });

    it("rethrows unexpected parser load failures", async () => {
        try {
            vi.doMock("node:module", () => {
                const mockedRequire = (moduleName: string): unknown => {
                    if (moduleName === "@typescript-eslint/parser") {
                        throw new Error("parser crashed unexpectedly");
                    }

                    if (moduleName === "../package.json") {
                        return {
                            version: "0.1.0",
                        };
                    }

                    throw new Error(`Unexpected module request: ${moduleName}`);
                };

                return {
                    createRequire: () => mockedRequire,
                };
            });

            await expect(import("../src/plugin")).rejects.toThrowError(
                "parser crashed unexpectedly"
            );
        } finally {
            resetRuntimeMocks();
        }
    });

    it("assigns default docs url when a rule docs object omits url", async () => {
        try {
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

            const pluginModule = await import("../src/plugin");
            const plugin = pluginModule.default;
            const arrayAtRule = plugin.rules["prefer-ts-extras-array-at"];

            expect(arrayAtRule).toBeDefined();

            if (arrayAtRule === undefined) {
                throw new TypeError("Expected prefer-ts-extras-array-at rule");
            }

            expect(arrayAtRule.meta?.docs?.url).toBe(
                "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-at"
            );
        } finally {
            resetRuntimeMocks();
        }
    });

    it("does not crash when a rule omits meta docs entirely", async () => {
        try {
            vi.doMock("../src/rules/prefer-ts-extras-array-at.js", () => ({
                default: {
                    create: () => ({}),
                    defaultOptions: [],
                },
            }));

            const pluginModule = await import("../src/plugin");
            const plugin = pluginModule.default;

            const arrayAtRule = plugin.rules["prefer-ts-extras-array-at"];

            expect(arrayAtRule).toBeDefined();

            if (arrayAtRule === undefined) {
                throw new TypeError("Expected prefer-ts-extras-array-at rule");
            }

            expect(arrayAtRule.meta).toBeUndefined();
        } finally {
            resetRuntimeMocks();
        }
    });
});
