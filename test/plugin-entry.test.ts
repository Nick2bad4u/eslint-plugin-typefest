import { describe, expect, it } from "vitest";

import plugin from "../plugin.mjs";

const expectedConfigRegistryShape = expect.objectContaining({
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
});

const expectedRuleRegistryShape = expect.objectContaining({
    "prefer-ts-extras-not": expect.any(Object),
    "prefer-type-fest-conditional-pick": expect.any(Object),
    "prefer-type-fest-if": expect.any(Object),
    "prefer-type-fest-iterable-element": expect.any(Object),
    "prefer-type-fest-json-array": expect.any(Object),
    "prefer-type-fest-json-primitive": expect.any(Object),
    "prefer-type-fest-keys-of-union": expect.any(Object),
    "prefer-type-fest-omit-index-signature": expect.any(Object),
    "prefer-type-fest-require-all-or-none": expect.any(Object),
    "prefer-type-fest-require-at-least-one": expect.any(Object),
    "prefer-type-fest-require-exactly-one": expect.any(Object),
    "prefer-type-fest-require-one-or-none": expect.any(Object),
    "prefer-type-fest-schema": expect.any(Object),
    "prefer-type-fest-set-non-nullable": expect.any(Object),
    "prefer-type-fest-set-optional": expect.any(Object),
    "prefer-type-fest-set-readonly": expect.any(Object),
    "prefer-type-fest-set-required": expect.any(Object),
    "prefer-type-fest-simplify": expect.any(Object),
    "prefer-type-fest-tuple-of": expect.any(Object),
    "prefer-type-fest-unwrap-tagged": expect.any(Object),
});

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
        expect(plugin.configs).toEqual(expectedConfigRegistryShape);
        expect(plugin.rules).toEqual(expectedRuleRegistryShape);
    });
});
