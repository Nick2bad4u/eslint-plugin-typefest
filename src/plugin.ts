/**
 * @packageDocumentation
 * Public plugin entrypoint for eslint-plugin-typefest exports and preset wiring.
 */
import type { ESLint, Linter } from "eslint";
import type { Except } from "type-fest";

import typeScriptParser from "@typescript-eslint/parser";
import { objectEntries, objectHasIn, safeCastTo, setHas } from "ts-extras";

import type { TypefestConfigName as InternalTypefestConfigName } from "./_internal/typefest-config-references.js";

import packageJson from "../package.json" with { type: "json" };
import rulePresetMembershipByRuleName from "./_internal/rule-preset-membership.js";
import { typefestRules } from "./_internal/rules-registry.js";
import typeCheckedRuleNames from "./_internal/type-checked-rule-names.js";
import { typefestConfigNames } from "./_internal/typefest-config-references.js";

/** ESLint severity used by generated preset rule maps. */
const ERROR_SEVERITY = "error" as const;

/** Default file globs targeted by plugin presets when `files` is omitted. */
const TYPE_SCRIPT_FILES = ["**/*.{ts,tsx,mts,cts}"] as const;

/**
 * Canonical flat-config preset keys exposed through `plugin.configs`.
 *
 * @remarks
 * These names are used by consumers when composing presets in ESLint flat
 * config arrays.
 */
export type TypefestConfigName = InternalTypefestConfigName;

/**
 * Flat-config preset shape produced by this plugin.
 *
 * @remarks
 * The `rules` map is required so preset composition can always merge concrete
 * rule severity entries without additional null checks.
 */
export type TypefestPresetConfig = Linter.Config & {
    rules: NonNullable<Linter.Config["rules"]>;
};

/** Internal alias for flat config objects handled by preset builders. */
type FlatConfig = Linter.Config;

/** Normalized language-options shape for preset composition helpers. */
type FlatLanguageOptions = NonNullable<FlatConfig["languageOptions"]>;

/** Normalized parser-options shape for preset composition helpers. */
type FlatParserOptions = NonNullable<FlatLanguageOptions["parserOptions"]>;

/** Rule-map type used by preset rule-list expansion helpers. */
type RulesConfig = TypefestPresetConfig["rules"];

/** Contract for the `configs` object exported by this plugin. */
type TypefestConfigsContract = Record<TypefestConfigName, TypefestPresetConfig>;

/** Fully assembled plugin contract used by the runtime default export. */
type TypefestPluginContract = Except<ESLint.Plugin, "configs" | "rules"> & {
    configs: TypefestConfigsContract;
    meta: {
        name: string;
        namespace: string;
        version: string;
    };
    processors: NonNullable<ESLint.Plugin["processors"]>;
    rules: NonNullable<ESLint.Plugin["rules"]>;
};

/**
 * Resolve package version from package.json data.
 *
 * @param pkg - Parsed package metadata value.
 *
 * @returns The package version, or `0.0.0` when unavailable.
 */
function getPackageVersion(pkg: unknown): string {
    if (typeof pkg !== "object" || pkg === null) {
        return "0.0.0";
    }

    const version = Reflect.get(pkg, "version");

    return typeof version === "string" ? version : "0.0.0";
}

/** Package metadata used to populate plugin runtime `meta.version`. */
const packageJsonValue = safeCastTo<unknown>(packageJson);

/** Parser module reused across preset construction. */
const typeScriptParserValue: FlatLanguageOptions["parser"] = typeScriptParser;

/** Default parser options applied when a preset omits parser options. */
const defaultParserOptions = {
    ecmaVersion: "latest",
    sourceType: "module",
} satisfies FlatParserOptions;

/**
 * Normalize unknown parser options into a mutable parser-options object.
 */
const normalizeParserOptions = (
    parserOptions: FlatLanguageOptions["parserOptions"]
): FlatParserOptions =>
    parserOptions !== null &&
    typeof parserOptions === "object" &&
    !Array.isArray(parserOptions)
        ? { ...parserOptions }
        : { ...defaultParserOptions };

/**
 * Fully-qualified ESLint rule id used by this plugin.
 *
 * @remarks
 * Consumers typically use this when building strongly typed rule maps or helper
 * utilities that require namespaced rule identifiers.
 */
export type TypefestRuleId = `typefest/${TypefestRuleName}`;

/** Unqualified rule name supported by `eslint-plugin-typefest`. */
export type TypefestRuleName = keyof typeof typefestRules;

/**
 * ESLint-compatible rule map view of the strongly typed internal rule record.
 */
const typefestEslintRules: NonNullable<ESLint.Plugin["rules"]> &
    typeof typefestRules = typefestRules as NonNullable<
    ESLint.Plugin["rules"]
> &
    typeof typefestRules;

const isTypefestRuleName = (value: string): value is TypefestRuleName =>
    objectHasIn(typefestRules, value);

const typefestRuleEntries: readonly (readonly [
    TypefestRuleName,
    (typeof typefestRules)[TypefestRuleName],
])[] = (() => {
    const entries: (readonly [
        TypefestRuleName,
        (typeof typefestRules)[TypefestRuleName],
    ])[] = [];

    for (const [ruleName] of objectEntries(typefestRules)) {
        if (!isTypefestRuleName(ruleName)) {
            continue;
        }

        const ruleDefinition = typefestRules[ruleName];

        if (ruleDefinition === undefined) {
            continue;
        }

        entries.push([ruleName, ruleDefinition]);
    }

    return entries;
})();

type RulePresetMembership = Readonly<
    Partial<Record<TypefestRuleName, readonly TypefestConfigName[]>>
>;

const typefestConfigNameSet: ReadonlySet<string> = new Set(typefestConfigNames);

const isTypefestConfigName = (value: unknown): value is TypefestConfigName =>
    typeof value === "string" && setHas(typefestConfigNameSet, value);

const isTypefestConfigNameArray = (
    value: unknown
): value is readonly TypefestConfigName[] =>
    Array.isArray(value) && value.every((entry) => isTypefestConfigName(entry));

const deriveRulePresetMembership = (): RulePresetMembership => {
    const membership: Partial<
        Record<TypefestRuleName, readonly TypefestConfigName[]>
    > = {};

    for (const [ruleName, configNames] of objectEntries(
        rulePresetMembershipByRuleName
    )) {
        if (!isTypefestRuleName(ruleName)) {
            continue;
        }

        if (!isTypefestConfigNameArray(configNames)) {
            throw new TypeError(
                `Rule '${ruleName}' has invalid preset membership metadata.`
            );
        }

        membership[ruleName] = configNames;
    }

    return membership;
};

const rulePresetMembership = deriveRulePresetMembership();

const createEmptyPresetRuleMap = (): Record<
    TypefestConfigName,
    TypefestRuleName[]
> => ({
    all: [],
    minimal: [],
    recommended: [],
    "recommended-type-checked": [],
    strict: [],
    "ts-extras/type-guards": [],
    "type-fest/types": [],
});

const dedupeRuleNames = (
    ruleNames: readonly TypefestRuleName[]
): TypefestRuleName[] => [...new Set(ruleNames)];

const derivePresetRuleNamesByConfig = (): Readonly<
    Record<TypefestConfigName, readonly TypefestRuleName[]>
> => {
    const presetRuleNamesByConfig = createEmptyPresetRuleMap();

    for (const [ruleName] of typefestRuleEntries) {
        const configNames = rulePresetMembership[ruleName];

        if (!isTypefestConfigNameArray(configNames)) {
            throw new TypeError(
                `Rule '${ruleName}' is missing preset membership metadata.`
            );
        }

        for (const configName of configNames) {
            presetRuleNamesByConfig[configName].push(ruleName);
        }
    }

    return {
        all: dedupeRuleNames(presetRuleNamesByConfig.all),
        minimal: dedupeRuleNames(presetRuleNamesByConfig.minimal),
        recommended: dedupeRuleNames(presetRuleNamesByConfig.recommended),
        "recommended-type-checked": dedupeRuleNames(
            presetRuleNamesByConfig["recommended-type-checked"]
        ),
        strict: dedupeRuleNames(presetRuleNamesByConfig.strict),
        "ts-extras/type-guards": dedupeRuleNames(
            presetRuleNamesByConfig["ts-extras/type-guards"]
        ),
        "type-fest/types": dedupeRuleNames(
            presetRuleNamesByConfig["type-fest/types"]
        ),
    };
};

/**
 * Build an ESLint rules map that enables each provided rule at error level.
 *
 * @param ruleNames - Rule names to enable.
 *
 * @returns Rules config object compatible with flat config.
 */
function errorRulesFor(ruleNames: readonly TypefestRuleName[]): RulesConfig {
    const rules: RulesConfig = {};

    for (const ruleName of ruleNames) {
        rules[`typefest/${ruleName}`] = ERROR_SEVERITY;
    }

    return rules;
}

/**
 * Remove duplicates while preserving first-seen ordering.
 *
 * @param ruleNames - Candidate rule list.
 *
 * @returns Deduplicated rule list.
 */
const presetRuleNamesByConfig = derivePresetRuleNamesByConfig();

/** Recommended preset rule list for zero-type-info usage. */
const recommendedRuleNames: TypefestRuleName[] = [];

for (const ruleName of presetRuleNamesByConfig.recommended) {
    if (setHas(typeCheckedRuleNames, ruleName)) {
        continue;
    }

    recommendedRuleNames.push(ruleName);
}

/** Type-aware recommended preset rule list. */
const recommendedTypeCheckedRuleNames = dedupeRuleNames([
    ...recommendedRuleNames,
    ...presetRuleNamesByConfig["recommended-type-checked"],
]);

/** Strict preset rule list. */
const strictRuleNames = presetRuleNamesByConfig.strict;

/** All preset rule list. */
const allRuleNames = presetRuleNamesByConfig.all;

/** Minimal preset rule list. */
const minimalRuleNames = presetRuleNamesByConfig.minimal;

/** Ts-extras/type-guards preset rule list. */
const tsExtrasTypeGuardRuleNames =
    presetRuleNamesByConfig["ts-extras/type-guards"];

/** Type-fest/types preset rule list. */
const typeFestTypesRuleNames = presetRuleNamesByConfig["type-fest/types"];

/**
 * Apply parser and plugin metadata required by all plugin presets.
 *
 * @param config - Preset-specific config fragment.
 * @param plugin - Plugin object registered under the `typefest` namespace.
 * @param options - Preset-level wiring options.
 *
 * @returns Normalized preset config.
 */
function withTypefestPlugin(
    config: Readonly<TypefestPresetConfig>,
    plugin: Readonly<ESLint.Plugin>,
    options: Readonly<{ requiresTypeChecking: boolean }>
): TypefestPresetConfig {
    const existingLanguageOptions = config.languageOptions ?? {};
    const existingParserOptions = existingLanguageOptions["parserOptions"];
    const parserOptions = normalizeParserOptions(existingParserOptions);

    if (
        options.requiresTypeChecking &&
        !objectHasIn(parserOptions, "projectService")
    ) {
        Reflect.set(parserOptions, "projectService", true);
    }

    const languageOptions: FlatLanguageOptions = {
        ...existingLanguageOptions,
        parser: existingLanguageOptions["parser"] ?? typeScriptParserValue,
        parserOptions,
    };

    return {
        ...config,
        files: config.files ?? [...TYPE_SCRIPT_FILES],
        languageOptions,
        plugins: {
            ...config.plugins,
            typefest: plugin,
        },
    };
}

/** Minimal plugin object used when assembling flat-config presets. */
const pluginForConfigs: ESLint.Plugin = {
    rules: typefestEslintRules,
};

/**
 * Flat config presets distributed by eslint-plugin-typefest.
 */
const typefestConfigsDefinition = {
    all: withTypefestPlugin(
        {
            name: "typefest:all",
            rules: errorRulesFor(allRuleNames),
        },
        pluginForConfigs,
        {
            requiresTypeChecking: true,
        }
    ),
    minimal: withTypefestPlugin(
        {
            name: "typefest:minimal",
            rules: errorRulesFor(minimalRuleNames),
        },
        pluginForConfigs,
        {
            requiresTypeChecking: false,
        }
    ),
    recommended: withTypefestPlugin(
        {
            name: "typefest:recommended",
            rules: errorRulesFor(recommendedRuleNames),
        },
        pluginForConfigs,
        {
            requiresTypeChecking: false,
        }
    ),
    "recommended-type-checked": withTypefestPlugin(
        {
            name: "typefest:recommended-type-checked",
            rules: errorRulesFor(recommendedTypeCheckedRuleNames),
        },
        pluginForConfigs,
        {
            requiresTypeChecking: true,
        }
    ),
    strict: withTypefestPlugin(
        {
            name: "typefest:strict",
            rules: errorRulesFor(strictRuleNames),
        },
        pluginForConfigs,
        {
            requiresTypeChecking: true,
        }
    ),
    "ts-extras/type-guards": withTypefestPlugin(
        {
            name: "typefest:ts-extras/type-guards",
            rules: errorRulesFor(tsExtrasTypeGuardRuleNames),
        },
        pluginForConfigs,
        {
            requiresTypeChecking: true,
        }
    ),
    "type-fest/types": withTypefestPlugin(
        {
            name: "typefest:type-fest/types",
            rules: errorRulesFor(typeFestTypesRuleNames),
        },
        pluginForConfigs,
        {
            requiresTypeChecking: false,
        }
    ),
} satisfies TypefestConfigsContract;

/** Finalized typed view of all exported preset configurations. */
const typefestConfigs: TypefestConfigsContract = typefestConfigsDefinition;

/**
 * Runtime type for the plugin's generated config presets.
 *
 * @remarks
 * Mirrors `plugin.configs` and is useful when composing typed preset-aware
 * tooling in external integrations.
 */
export type TypefestConfigs = typeof typefestConfigs;

/**
 * Main plugin object exported for ESLint consumption.
 */
const typefestPlugin: TypefestPluginContract = {
    configs: typefestConfigs,
    meta: {
        name: "eslint-plugin-typefest",
        namespace: "typefest",
        version: getPackageVersion(packageJsonValue),
    },
    processors: {},
    rules: typefestEslintRules,
};

/**
 * Runtime type for the plugin object exported as default.
 *
 * @remarks
 * Includes resolved `meta`, `rules`, and `configs` contracts after plugin
 * assembly.
 */
export type TypefestPlugin = typeof typefestPlugin;

/**
 * Default plugin export consumed by ESLint flat config.
 */
export default typefestPlugin;
