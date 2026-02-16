import { describe, expect, it } from "vitest";

import plugin from "../plugin.mjs";

describe("plugin entry module", () => {
    it("exports default plugin object with rule and config registries", () => {
        expect(plugin).toEqual(
            expect.objectContaining({
                configs: expect.any(Object),
                rules: expect.any(Object),
            })
        );
    });

    it("exposes critical presets and latest rule registrations", () => {
        expect(plugin.configs).toEqual(
            expect.objectContaining({
                all: expect.any(Object),
                "flat/all": expect.any(Object),
                "flat/minimal": expect.any(Object),
                "flat/recommended": expect.any(Object),
                "flat/safe": expect.any(Object),
                "flat/strict": expect.any(Object),
                minimal: expect.any(Object),
                recommended: expect.any(Object),
                safe: expect.any(Object),
                strict: expect.any(Object),
            })
        );

        expect(plugin.rules).toEqual(
            expect.objectContaining({
                "prefer-ts-extras-not": expect.any(Object),
                "prefer-type-fest-json-array": expect.any(Object),
                "prefer-type-fest-json-primitive": expect.any(Object),
            })
        );
    });
});
