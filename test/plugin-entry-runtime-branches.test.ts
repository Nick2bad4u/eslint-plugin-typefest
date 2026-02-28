import { describe, expect, it, vi } from "vitest";

/** Reset module cache/mocks so each runtime-branch assertion is isolated. */
const resetPluginEntryMocks = (): void => {
    vi.resetModules();
    vi.doUnmock("../dist/plugin.js");
};

describe("plugin.mjs runtime normalization branches", () => {
    it("normalizes non-object dist exports to empty plugin registries", async () => {
        try {
            vi.doMock("../dist/plugin.js", () => ({
                default: "invalid-plugin-export",
            }));

            const pluginModule = await import("../plugin.mjs");

            expect(pluginModule.default).toStrictEqual({
                configs: {},
                meta: {},
                processors: {},
                rules: {},
            });
        } finally {
            resetPluginEntryMocks();
        }
    });
});
