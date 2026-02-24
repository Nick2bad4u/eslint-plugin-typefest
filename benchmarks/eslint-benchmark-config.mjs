import tsParser from "@typescript-eslint/parser";
import path from "node:path";

import typefestPlugin from "../plugin.mjs";

const benchmarkDirectory = import.meta.dirname;

/**
 * @typedef {Record<string, unknown>} UnknownRecord
 */

/**
 * @typedef {{ rules: UnknownRecord }} CreateTypefestFlatConfigOptions
 */

/**
 * Absolute repository root used by parser services and benchmark paths.
 */
export const repositoryRoot = path.resolve(benchmarkDirectory, "..");

/**
 * Shared file globs used by benchmark scenarios.
 */
export const benchmarkFileGlobs = Object.freeze({
    arrayableStressFixture: Object.freeze([
        "benchmarks/fixtures/arrayable.stress.ts",
    ]),
    isPresentStressFixture: Object.freeze([
        "benchmarks/fixtures/is-present.stress.ts",
    ]),
    tsExtrasInvalidFixtures: Object.freeze([
        "test/fixtures/typed/prefer-ts-extras-*.invalid.ts",
    ]),
    typedInvalidFixtures: Object.freeze(["test/fixtures/typed/*.invalid.ts"]),
    typeFestInvalidFixtures: Object.freeze([
        "test/fixtures/typed/prefer-type-fest-*.invalid.ts",
    ]),
});

/**
 * Ensure a dynamic value is a non-null object record.
 *
 * @param {unknown} value - Value to validate.
 * @param {string} label - Error label for diagnostics.
 *
 * @returns {UnknownRecord} Normalized object record.
 */
const ensureRecord = (value, label) => {
    if (typeof value !== "object" || value === null) {
        throw new TypeError(`${label} must be a non-null object.`);
    }

    return value;
};

/**
 * Resolve rules from a plugin preset by name.
 *
 * @param {string} presetName - Key under `typefestPlugin.configs`.
 *
 * @returns {Readonly<UnknownRecord>} Frozen rule map suitable for flat config.
 */
const resolveRuleSet = (presetName) => {
    const configs = ensureRecord(
        typefestPlugin.configs,
        "typefestPlugin.configs"
    );
    const preset = ensureRecord(
        configs[presetName],
        `typefestPlugin.configs.${presetName}`
    );
    const rules = ensureRecord(preset.rules, `${presetName} preset rules`);

    return Object.freeze({ ...rules });
};

/**
 * Plugin rule sets used by benchmark scenarios.
 */
export const typefestRuleSets = Object.freeze({
    all: resolveRuleSet("all"),
    minimal: resolveRuleSet("minimal"),
    recommended: resolveRuleSet("recommended"),
    strict: resolveRuleSet("strict"),
    tsExtrasTypeGuards: resolveRuleSet("ts-extras/type-guards"),
    typeFestTypes: resolveRuleSet("type-fest/types"),
});

/**
 * Create a flat ESLint config array for typefest benchmark scenarios.
 *
 * @param {CreateTypefestFlatConfigOptions} options - Config creation options.
 *
 * @returns {import("eslint").Linter.Config[]} Flat config array for ESLint Node
 *   API / CLI usage.
 */
export const createTypefestFlatConfig = ({ rules }) => [
    {
        files: ["**/*.{ts,tsx,mts,cts}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                project: "./tsconfig.eslint.json",
                sourceType: "module",
                tsconfigRootDir: repositoryRoot,
            },
        },
        name: "benchmark:typefest",
        plugins: {
            typefest: typefestPlugin,
        },
        rules,
    },
];
