/**
 * @packageDocumentation
 * Public plugin entrypoint for eslint-plugin-typefest exports and preset wiring.
 */
import type { TSESLint } from "@typescript-eslint/utils";
import type { ESLint, Linter } from "eslint";
import type { PackageJson, UnknownArray } from "type-fest";

import { createRequire } from "node:module";

import type {
    TypefestConfigName as InternalTypefestConfigName,
    TypefestConfigReference,
} from "./_internal/typefest-config-references.js";

import { createRuleDocsUrl } from "./_internal/rule-docs-url.js";
import {
    defaultRecommendedConfigReferences,
    isTypefestConfigReference,
    typefestConfigReferenceToName,
} from "./_internal/typefest-config-references.js";
import preferTsExtrasArrayAtRule from "./rules/prefer-ts-extras-array-at.js";
import preferTsExtrasArrayConcatRule from "./rules/prefer-ts-extras-array-concat.js";
import preferTsExtrasArrayFindLastIndexRule from "./rules/prefer-ts-extras-array-find-last-index.js";
import preferTsExtrasArrayFindLastRule from "./rules/prefer-ts-extras-array-find-last.js";
import preferTsExtrasArrayFindRule from "./rules/prefer-ts-extras-array-find.js";
import preferTsExtrasArrayFirstRule from "./rules/prefer-ts-extras-array-first.js";
import preferTsExtrasArrayIncludesRule from "./rules/prefer-ts-extras-array-includes.js";
import preferTsExtrasArrayJoinRule from "./rules/prefer-ts-extras-array-join.js";
import preferTsExtrasArrayLastRule from "./rules/prefer-ts-extras-array-last.js";
import preferTsExtrasAsWritableRule from "./rules/prefer-ts-extras-as-writable.js";
import preferTsExtrasAssertDefinedRule from "./rules/prefer-ts-extras-assert-defined.js";
import preferTsExtrasAssertErrorRule from "./rules/prefer-ts-extras-assert-error.js";
import preferTsExtrasAssertPresentRule from "./rules/prefer-ts-extras-assert-present.js";
import preferTsExtrasIsDefinedFilterRule from "./rules/prefer-ts-extras-is-defined-filter.js";
import preferTsExtrasIsDefinedRule from "./rules/prefer-ts-extras-is-defined.js";
import preferTsExtrasIsEmptyRule from "./rules/prefer-ts-extras-is-empty.js";
import preferTsExtrasIsEqualTypeRule from "./rules/prefer-ts-extras-is-equal-type.js";
import preferTsExtrasIsFiniteRule from "./rules/prefer-ts-extras-is-finite.js";
import preferTsExtrasIsInfiniteRule from "./rules/prefer-ts-extras-is-infinite.js";
import preferTsExtrasIsIntegerRule from "./rules/prefer-ts-extras-is-integer.js";
import preferTsExtrasIsPresentFilterRule from "./rules/prefer-ts-extras-is-present-filter.js";
import preferTsExtrasIsPresentRule from "./rules/prefer-ts-extras-is-present.js";
import preferTsExtrasIsSafeIntegerRule from "./rules/prefer-ts-extras-is-safe-integer.js";
import preferTsExtrasKeyInRule from "./rules/prefer-ts-extras-key-in.js";
import preferTsExtrasNotRule from "./rules/prefer-ts-extras-not.js";
import preferTsExtrasObjectEntriesRule from "./rules/prefer-ts-extras-object-entries.js";
import preferTsExtrasObjectFromEntriesRule from "./rules/prefer-ts-extras-object-from-entries.js";
import preferTsExtrasObjectHasInRule from "./rules/prefer-ts-extras-object-has-in.js";
import preferTsExtrasObjectHasOwnRule from "./rules/prefer-ts-extras-object-has-own.js";
import preferTsExtrasObjectKeysRule from "./rules/prefer-ts-extras-object-keys.js";
import preferTsExtrasObjectValuesRule from "./rules/prefer-ts-extras-object-values.js";
import preferTsExtrasSafeCastToRule from "./rules/prefer-ts-extras-safe-cast-to.js";
import preferTsExtrasSetHasRule from "./rules/prefer-ts-extras-set-has.js";
import preferTsExtrasStringSplitRule from "./rules/prefer-ts-extras-string-split.js";
import preferTypeFestAbstractConstructorRule from "./rules/prefer-type-fest-abstract-constructor.js";
import preferTypeFestArrayableRule from "./rules/prefer-type-fest-arrayable.js";
import preferTypeFestAsyncReturnTypeRule from "./rules/prefer-type-fest-async-return-type.js";
import preferTypeFestConditionalPickRule from "./rules/prefer-type-fest-conditional-pick.js";
import preferTypeFestConstructorRule from "./rules/prefer-type-fest-constructor.js";
import preferTypeFestExceptRule from "./rules/prefer-type-fest-except.js";
import preferTypeFestIfRule from "./rules/prefer-type-fest-if.js";
import preferTypeFestIterableElementRule from "./rules/prefer-type-fest-iterable-element.js";
import preferTypeFestJsonArrayRule from "./rules/prefer-type-fest-json-array.js";
import preferTypeFestJsonObjectRule from "./rules/prefer-type-fest-json-object.js";
import preferTypeFestJsonPrimitiveRule from "./rules/prefer-type-fest-json-primitive.js";
import preferTypeFestJsonValueRule from "./rules/prefer-type-fest-json-value.js";
import preferTypeFestKeysOfUnionRule from "./rules/prefer-type-fest-keys-of-union.js";
import preferTypeFestLiteralUnionRule from "./rules/prefer-type-fest-literal-union.js";
import preferTypeFestMergeExclusiveRule from "./rules/prefer-type-fest-merge-exclusive.js";
import preferTypeFestNonEmptyTupleRule from "./rules/prefer-type-fest-non-empty-tuple.js";
import preferTypeFestOmitIndexSignatureRule from "./rules/prefer-type-fest-omit-index-signature.js";
import preferTypeFestPartialDeepRule from "./rules/prefer-type-fest-partial-deep.js";
import preferTypeFestPrimitiveRule from "./rules/prefer-type-fest-primitive.js";
import preferTypeFestPromisableRule from "./rules/prefer-type-fest-promisable.js";
import preferTypeFestReadonlyDeepRule from "./rules/prefer-type-fest-readonly-deep.js";
import preferTypeFestRequireAllOrNoneRule from "./rules/prefer-type-fest-require-all-or-none.js";
import preferTypeFestRequireAtLeastOneRule from "./rules/prefer-type-fest-require-at-least-one.js";
import preferTypeFestRequireExactlyOneRule from "./rules/prefer-type-fest-require-exactly-one.js";
import preferTypeFestRequireOneOrNoneRule from "./rules/prefer-type-fest-require-one-or-none.js";
import preferTypeFestRequiredDeepRule from "./rules/prefer-type-fest-required-deep.js";
import preferTypeFestSchemaRule from "./rules/prefer-type-fest-schema.js";
import preferTypeFestSetNonNullableRule from "./rules/prefer-type-fest-set-non-nullable.js";
import preferTypeFestSetOptionalRule from "./rules/prefer-type-fest-set-optional.js";
import preferTypeFestSetReadonlyRule from "./rules/prefer-type-fest-set-readonly.js";
import preferTypeFestSetRequiredRule from "./rules/prefer-type-fest-set-required.js";
import preferTypeFestSimplifyRule from "./rules/prefer-type-fest-simplify.js";
import preferTypeFestTaggedBrandsRule from "./rules/prefer-type-fest-tagged-brands.js";
import preferTypeFestTupleOfRule from "./rules/prefer-type-fest-tuple-of.js";
import preferTypeFestUnknownArrayRule from "./rules/prefer-type-fest-unknown-array.js";
import preferTypeFestUnknownMapRule from "./rules/prefer-type-fest-unknown-map.js";
import preferTypeFestUnknownRecordRule from "./rules/prefer-type-fest-unknown-record.js";
import preferTypeFestUnknownSetRule from "./rules/prefer-type-fest-unknown-set.js";
import preferTypeFestUnwrapTaggedRule from "./rules/prefer-type-fest-unwrap-tagged.js";
import preferTypeFestValueOfRule from "./rules/prefer-type-fest-value-of.js";
import preferTypeFestWritableDeepRule from "./rules/prefer-type-fest-writable-deep.js";
import preferTypeFestWritableRule from "./rules/prefer-type-fest-writable.js";

/**
 * CommonJS `require` bridge used to load package metadata and optional parser
 * dependencies from this ESM entrypoint.
 */
const require = createRequire(import.meta.url);

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

/** Rule-map type used by preset rule-list expansion helpers. */
type RulesConfig = TypefestPresetConfig["rules"];

/** Rule module shape extended with optional docs metadata. */
type RuleWithDocs = TSESLint.RuleModule<string, UnknownArray> & {
    meta?: {
        docs?: {
            recommended?: boolean | readonly string[] | string;
            url?: string;
        };
    };
};

/** Contract for the `configs` object exported by this plugin. */
type TypefestConfigsContract = Record<TypefestConfigName, TypefestPresetConfig>;

/** Fully assembled plugin contract used by the runtime default export. */
type TypefestPluginContract = Omit<ESLint.Plugin, "configs" | "rules"> & {
    configs: TypefestConfigsContract;
    meta: {
        name: string;
        namespace: string;
        version: string;
    };
    processors: NonNullable<ESLint.Plugin["processors"]>;
    rules: NonNullable<ESLint.Plugin["rules"]>;
};

/** Optional parser module shape accepted for runtime parser wiring. */
type TypeScriptParser = {
    parse?: (...parameters: UnknownArray) => unknown;
    parseForESLint?: (...parameters: UnknownArray) => unknown;
};

/**
 * Resolve package version from package.json data.
 *
 * @param pkg - Parsed package manifest.
 *
 * @returns The package version, or `0.0.0` when unavailable.
 */
function getPackageVersion(pkg: Readonly<PackageJson>): string {
    return typeof pkg.version === "string" ? pkg.version : "0.0.0";
}

/**
 * Safely read a property from an unknown object value.
 */
const getUnknownObjectProperty = (
    value: unknown,
    propertyName: string
): unknown => {
    if (typeof value !== "object" || value === null) {
        return undefined;
    }

    return Reflect.get(value, propertyName);
};

/**
 * Determine whether a caught `require` error represents a missing module.
 */
const hasModuleNotFoundCode = (
    error: unknown
): error is Readonly<{ code: "ERR_MODULE_NOT_FOUND" | "MODULE_NOT_FOUND" }> => {
    const code = getUnknownObjectProperty(error, "code");

    return code === "MODULE_NOT_FOUND" || code === "ERR_MODULE_NOT_FOUND";
};

/**
 * Check whether a parser load failure is the expected optional-dependency miss.
 */
const isMissingTypeScriptParserError = (error: unknown): boolean => {
    if (!hasModuleNotFoundCode(error)) {
        return false;
    }

    const message = getUnknownObjectProperty(error, "message");

    return (
        typeof message === "string" &&
        message.includes("@typescript-eslint/parser")
    );
};

/**
 * Load the TypeScript ESLint parser lazily to support optional dependency
 * setups.
 *
 * @returns Parser module when available; otherwise `null`.
 */
function loadTypeScriptParser(): null | TypeScriptParser {
    try {
        return require("@typescript-eslint/parser") as TypeScriptParser;
    } catch (error: unknown) {
        if (!isMissingTypeScriptParserError(error)) {
            throw error;
        }

        return null;
    }
}

/** Package metadata used to populate plugin runtime `meta.version`. */
const packageJson = require("../package.json") as PackageJson;

/** Optional parser module instance reused across preset construction. */
const typeScriptParser = loadTypeScriptParser();

/** Pattern for unqualified rule names supported by `eslint-plugin-typefest`. */
type TypefestRuleNamePattern = `prefer-${string}`;

/**
 * Runtime map of all rule modules keyed by unqualified rule name.
 */
const typefestRules: Readonly<Record<TypefestRuleNamePattern, RuleWithDocs>> = {
    "prefer-ts-extras-array-at": preferTsExtrasArrayAtRule,
    "prefer-ts-extras-array-concat": preferTsExtrasArrayConcatRule,
    "prefer-ts-extras-array-find": preferTsExtrasArrayFindRule,
    "prefer-ts-extras-array-find-last": preferTsExtrasArrayFindLastRule,
    "prefer-ts-extras-array-find-last-index":
        preferTsExtrasArrayFindLastIndexRule,
    "prefer-ts-extras-array-first": preferTsExtrasArrayFirstRule,
    "prefer-ts-extras-array-includes": preferTsExtrasArrayIncludesRule,
    "prefer-ts-extras-array-join": preferTsExtrasArrayJoinRule,
    "prefer-ts-extras-array-last": preferTsExtrasArrayLastRule,
    "prefer-ts-extras-as-writable": preferTsExtrasAsWritableRule,
    "prefer-ts-extras-assert-defined": preferTsExtrasAssertDefinedRule,
    "prefer-ts-extras-assert-error": preferTsExtrasAssertErrorRule,
    "prefer-ts-extras-assert-present": preferTsExtrasAssertPresentRule,
    "prefer-ts-extras-is-defined": preferTsExtrasIsDefinedRule,
    "prefer-ts-extras-is-defined-filter": preferTsExtrasIsDefinedFilterRule,
    "prefer-ts-extras-is-empty": preferTsExtrasIsEmptyRule,
    "prefer-ts-extras-is-equal-type": preferTsExtrasIsEqualTypeRule,
    "prefer-ts-extras-is-finite": preferTsExtrasIsFiniteRule,
    "prefer-ts-extras-is-infinite": preferTsExtrasIsInfiniteRule,
    "prefer-ts-extras-is-integer": preferTsExtrasIsIntegerRule,
    "prefer-ts-extras-is-present": preferTsExtrasIsPresentRule,
    "prefer-ts-extras-is-present-filter": preferTsExtrasIsPresentFilterRule,
    "prefer-ts-extras-is-safe-integer": preferTsExtrasIsSafeIntegerRule,
    "prefer-ts-extras-key-in": preferTsExtrasKeyInRule,
    "prefer-ts-extras-not": preferTsExtrasNotRule,
    "prefer-ts-extras-object-entries": preferTsExtrasObjectEntriesRule,
    "prefer-ts-extras-object-from-entries": preferTsExtrasObjectFromEntriesRule,
    "prefer-ts-extras-object-has-in": preferTsExtrasObjectHasInRule,
    "prefer-ts-extras-object-has-own": preferTsExtrasObjectHasOwnRule,
    "prefer-ts-extras-object-keys": preferTsExtrasObjectKeysRule,
    "prefer-ts-extras-object-values": preferTsExtrasObjectValuesRule,
    "prefer-ts-extras-safe-cast-to": preferTsExtrasSafeCastToRule,
    "prefer-ts-extras-set-has": preferTsExtrasSetHasRule,
    "prefer-ts-extras-string-split": preferTsExtrasStringSplitRule,
    "prefer-type-fest-abstract-constructor":
        preferTypeFestAbstractConstructorRule,
    "prefer-type-fest-arrayable": preferTypeFestArrayableRule,
    "prefer-type-fest-async-return-type": preferTypeFestAsyncReturnTypeRule,
    "prefer-type-fest-conditional-pick": preferTypeFestConditionalPickRule,
    "prefer-type-fest-constructor": preferTypeFestConstructorRule,
    "prefer-type-fest-except": preferTypeFestExceptRule,
    "prefer-type-fest-if": preferTypeFestIfRule,
    "prefer-type-fest-iterable-element": preferTypeFestIterableElementRule,
    "prefer-type-fest-json-array": preferTypeFestJsonArrayRule,
    "prefer-type-fest-json-object": preferTypeFestJsonObjectRule,
    "prefer-type-fest-json-primitive": preferTypeFestJsonPrimitiveRule,
    "prefer-type-fest-json-value": preferTypeFestJsonValueRule,
    "prefer-type-fest-keys-of-union": preferTypeFestKeysOfUnionRule,
    "prefer-type-fest-literal-union": preferTypeFestLiteralUnionRule,
    "prefer-type-fest-merge-exclusive": preferTypeFestMergeExclusiveRule,
    "prefer-type-fest-non-empty-tuple": preferTypeFestNonEmptyTupleRule,
    "prefer-type-fest-omit-index-signature":
        preferTypeFestOmitIndexSignatureRule,
    "prefer-type-fest-partial-deep": preferTypeFestPartialDeepRule,
    "prefer-type-fest-primitive": preferTypeFestPrimitiveRule,
    "prefer-type-fest-promisable": preferTypeFestPromisableRule,
    "prefer-type-fest-readonly-deep": preferTypeFestReadonlyDeepRule,
    "prefer-type-fest-require-all-or-none": preferTypeFestRequireAllOrNoneRule,
    "prefer-type-fest-require-at-least-one":
        preferTypeFestRequireAtLeastOneRule,
    "prefer-type-fest-require-exactly-one": preferTypeFestRequireExactlyOneRule,
    "prefer-type-fest-require-one-or-none": preferTypeFestRequireOneOrNoneRule,
    "prefer-type-fest-required-deep": preferTypeFestRequiredDeepRule,
    "prefer-type-fest-schema": preferTypeFestSchemaRule,
    "prefer-type-fest-set-non-nullable": preferTypeFestSetNonNullableRule,
    "prefer-type-fest-set-optional": preferTypeFestSetOptionalRule,
    "prefer-type-fest-set-readonly": preferTypeFestSetReadonlyRule,
    "prefer-type-fest-set-required": preferTypeFestSetRequiredRule,
    "prefer-type-fest-simplify": preferTypeFestSimplifyRule,
    "prefer-type-fest-tagged-brands": preferTypeFestTaggedBrandsRule,
    "prefer-type-fest-tuple-of": preferTypeFestTupleOfRule,
    "prefer-type-fest-unknown-array": preferTypeFestUnknownArrayRule,
    "prefer-type-fest-unknown-map": preferTypeFestUnknownMapRule,
    "prefer-type-fest-unknown-record": preferTypeFestUnknownRecordRule,
    "prefer-type-fest-unknown-set": preferTypeFestUnknownSetRule,
    "prefer-type-fest-unwrap-tagged": preferTypeFestUnwrapTaggedRule,
    "prefer-type-fest-value-of": preferTypeFestValueOfRule,
    "prefer-type-fest-writable": preferTypeFestWritableRule,
    "prefer-type-fest-writable-deep": preferTypeFestWritableDeepRule,
};

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

const typefestRuleEntries = Object.entries(
    typefestRules
) as readonly (readonly [TypefestRuleName, RuleWithDocs])[];

for (const [ruleName, rule] of typefestRuleEntries) {
    if (rule.meta?.docs) {
        rule.meta.docs.url ??= createRuleDocsUrl(ruleName);
    }
}

const createEmptyPresetRuleMap = (): Record<
    TypefestConfigName,
    TypefestRuleName[]
> => ({
    all: [],
    minimal: [],
    recommended: [],
    strict: [],
    "ts-extras/type-guards": [],
    "type-fest/types": [],
});

const normalizeRecommendedConfigReferences = (
    recommended: RuleWithDocs["meta"] extends { docs?: infer Docs }
        ? Docs extends { recommended?: infer Value }
            ? undefined | Value
            : never
        : never
): readonly TypefestConfigReference[] => {
    if (recommended === true) {
        return defaultRecommendedConfigReferences;
    }

    if (typeof recommended === "string") {
        return isTypefestConfigReference(recommended) ? [recommended] : [];
    }

    if (!Array.isArray(recommended)) {
        return [];
    }

    const references: TypefestConfigReference[] = [];

    for (const candidate of recommended) {
        if (typeof candidate !== "string") {
            continue;
        }

        if (!isTypefestConfigReference(candidate)) {
            continue;
        }

        references.push(candidate);
    }

    return references;
};

const derivePresetRuleNamesByConfig = (): Readonly<
    Record<TypefestConfigName, readonly TypefestRuleName[]>
> => {
    const presetRuleNamesByConfig = createEmptyPresetRuleMap();

    for (const [ruleName, rule] of typefestRuleEntries) {
        const references = normalizeRecommendedConfigReferences(
            rule.meta?.docs?.recommended
        );

        for (const reference of references) {
            const configName = typefestConfigReferenceToName[reference];
            presetRuleNamesByConfig[configName].push(ruleName);
        }
    }

    return {
        all: [...new Set(presetRuleNamesByConfig.all)],
        minimal: [...new Set(presetRuleNamesByConfig.minimal)],
        recommended: [...new Set(presetRuleNamesByConfig.recommended)],
        strict: [...new Set(presetRuleNamesByConfig.strict)],
        "ts-extras/type-guards": [
            ...new Set(presetRuleNamesByConfig["ts-extras/type-guards"]),
        ],
        "type-fest/types": [
            ...new Set(presetRuleNamesByConfig["type-fest/types"]),
        ],
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

/** Recommended preset rule list derived from docs metadata. */
const recommendedRuleNames = presetRuleNamesByConfig.recommended;

/** Strict preset rule list derived from docs metadata. */
const strictRuleNames = presetRuleNamesByConfig.strict;

/** All preset rule list derived from docs metadata. */
const allRuleNames = presetRuleNamesByConfig.all;

/** Minimal preset rule list derived from docs metadata. */
const minimalRuleNames = presetRuleNamesByConfig.minimal;

/** Ts-extras/type-guards preset rule list derived from docs metadata. */
const tsExtrasTypeGuardRuleNames =
    presetRuleNamesByConfig["ts-extras/type-guards"];

/** Type-fest/types preset rule list derived from docs metadata. */
const typeFestTypesRuleNames = presetRuleNamesByConfig["type-fest/types"];

/**
 * Apply parser and plugin metadata required by all plugin presets.
 *
 * @param config - Preset-specific config fragment.
 * @param plugin - Plugin object registered under the `typefest` namespace.
 *
 * @returns Normalized preset config.
 */
function withTypefestPlugin(
    config: Readonly<TypefestPresetConfig>,
    plugin: Readonly<ESLint.Plugin>
): TypefestPresetConfig {
    const existingLanguageOptions = config.languageOptions ?? {};

    const languageOptions: FlatLanguageOptions = {
        ...existingLanguageOptions,
    };

    if (typeScriptParser) {
        languageOptions["parser"] =
            existingLanguageOptions["parser"] ??
            (typeScriptParser as FlatLanguageOptions["parser"]);

        const existingParserOptions = existingLanguageOptions["parserOptions"];

        languageOptions["parserOptions"] =
            existingParserOptions !== undefined &&
            existingParserOptions !== null &&
            typeof existingParserOptions === "object" &&
            !Array.isArray(existingParserOptions)
                ? { ...existingParserOptions }
                : {
                      ecmaVersion: "latest",
                      sourceType: "module",
                  };
    }

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
        pluginForConfigs
    ),
    minimal: withTypefestPlugin(
        {
            name: "typefest:minimal",
            rules: errorRulesFor(minimalRuleNames),
        },
        pluginForConfigs
    ),
    recommended: withTypefestPlugin(
        {
            name: "typefest:recommended",
            rules: errorRulesFor(recommendedRuleNames),
        },
        pluginForConfigs
    ),
    strict: withTypefestPlugin(
        {
            name: "typefest:strict",
            rules: errorRulesFor(strictRuleNames),
        },
        pluginForConfigs
    ),
    "ts-extras/type-guards": withTypefestPlugin(
        {
            name: "typefest:ts-extras/type-guards",
            rules: errorRulesFor(tsExtrasTypeGuardRuleNames),
        },
        pluginForConfigs
    ),
    "type-fest/types": withTypefestPlugin(
        {
            name: "typefest:type-fest/types",
            rules: errorRulesFor(typeFestTypesRuleNames),
        },
        pluginForConfigs
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
        version: getPackageVersion(packageJson),
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
