/**
 * @packageDocumentation
 * Public plugin entrypoint for eslint-plugin-typefest exports and preset wiring.
 */
import type { TSESLint } from "@typescript-eslint/utils";
import type { ESLint, Linter } from "eslint";
import type { PackageJson } from "type-fest";

import { createRequire } from "node:module";

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
 * ESLint plugin for TypeFest and ts-extras utilities. Provides rules to
 * encourage usage of type-safe utilities from these libraries.
 */
const require = createRequire(import.meta.url);

const DEFAULT_RULE_DOCS_URL_BASE =
    "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules";
const ERROR_SEVERITY = "error" as const;
const TYPE_SCRIPT_FILES = ["**/*.{ts,tsx,mts,cts}"] as const;

/**
 * Available preset keys exposed through plugin `configs`.
 */
export type TypefestConfigName =
    | "all"
    | "minimal"
    | "recommended"
    | "strict"
    | "ts-extras/type-guards"
    | "type-fest/types";

/**
 * Flat config preset shape produced by this plugin.
 */
export type TypefestPresetConfig = Linter.Config & {
    rules: NonNullable<Linter.Config["rules"]>;
};
type FlatConfig = Linter.Config;
type FlatLanguageOptions = NonNullable<FlatConfig["languageOptions"]>;
type RulesConfig = TypefestPresetConfig["rules"];
type RuleWithDocs = TSESLint.RuleModule<string, readonly unknown[]> & {
    meta?: {
        docs?: {
            url?: string;
        };
    };
};
type TypefestConfigsContract = Record<TypefestConfigName, TypefestPresetConfig>;
type TypefestPluginContract = Omit<ESLint.Plugin, "configs" | "rules"> & {
    configs: TypefestConfigsContract;
    meta: {
        name: string;
        version: string;
    };
    processors: NonNullable<ESLint.Plugin["processors"]>;
    rules: NonNullable<ESLint.Plugin["rules"]> & typeof typefestRules;
};
type TypeScriptParser = {
    parse?: (...parameters: readonly unknown[]) => unknown;
    parseForESLint?: (...parameters: readonly unknown[]) => unknown;
};

/**
 * Resolve package version from package.json data.
 *
 * @param pkg - Parsed package manifest.
 *
 * @returns The package version, or `0.0.0` when unavailable.
 */
function getPackageVersion(pkg: PackageJson): string {
    return typeof pkg.version === "string" ? pkg.version : "0.0.0";
}

/**
 * Load the TypeScript ESLint parser lazily to support optional dependency
 * setups.
 *
 * @returns Parser module when available; otherwise `null`.
 */
function loadTypeScriptParser(): null | TypeScriptParser {
    try {
        return require("@typescript-eslint/parser") as TypeScriptParser;
    } catch {
        return null;
    }
}

const packageJson = require("../package.json") as PackageJson;

const typeScriptParser = loadTypeScriptParser();

/**
 * Map of all rule modules exported by eslint-plugin-typefest.
 */
const typefestRules = {
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
} as const satisfies Record<string, RuleWithDocs>;

/**
 * Fully-qualified ESLint rule id used by this plugin.
 */
export type TypefestRuleId = `typefest/${keyof typeof typefestRules}`;

/**
 * Unqualified rule name.
 */
export type TypefestRuleName = keyof typeof typefestRules;

const typefestEslintRules = typefestRules as unknown as NonNullable<
    ESLint.Plugin["rules"]
> &
    typeof typefestRules;

for (const [ruleName, rule] of Object.entries(typefestRules)) {
    if (rule.meta?.docs) {
        rule.meta.docs.url ??= `${DEFAULT_RULE_DOCS_URL_BASE}/${ruleName}.md`;
    }
}

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
function uniqueRuleNames(
    ruleNames: readonly TypefestRuleName[]
): TypefestRuleName[] {
    return [...new Set(ruleNames)];
}

const typeFestTypesRuleNames = [
    "prefer-type-fest-abstract-constructor",
    "prefer-type-fest-async-return-type",
    "prefer-type-fest-arrayable",
    "prefer-type-fest-conditional-pick",
    "prefer-type-fest-constructor",
    "prefer-type-fest-except",
    "prefer-type-fest-if",
    "prefer-type-fest-iterable-element",
    "prefer-type-fest-json-array",
    "prefer-type-fest-json-object",
    "prefer-type-fest-json-primitive",
    "prefer-type-fest-json-value",
    "prefer-type-fest-keys-of-union",
    "prefer-type-fest-literal-union",
    "prefer-type-fest-merge-exclusive",
    "prefer-type-fest-non-empty-tuple",
    "prefer-type-fest-omit-index-signature",
    "prefer-type-fest-partial-deep",
    "prefer-type-fest-primitive",
    "prefer-type-fest-promisable",
    "prefer-type-fest-readonly-deep",
    "prefer-type-fest-require-all-or-none",
    "prefer-type-fest-require-at-least-one",
    "prefer-type-fest-require-exactly-one",
    "prefer-type-fest-require-one-or-none",
    "prefer-type-fest-required-deep",
    "prefer-type-fest-schema",
    "prefer-type-fest-set-non-nullable",
    "prefer-type-fest-set-optional",
    "prefer-type-fest-set-readonly",
    "prefer-type-fest-set-required",
    "prefer-type-fest-simplify",
    "prefer-type-fest-tagged-brands",
    "prefer-type-fest-tuple-of",
    "prefer-type-fest-unknown-array",
    "prefer-type-fest-unknown-map",
    "prefer-type-fest-unknown-record",
    "prefer-type-fest-unknown-set",
    "prefer-type-fest-unwrap-tagged",
    "prefer-type-fest-value-of",
    "prefer-type-fest-writable",
    "prefer-type-fest-writable-deep",
] as const satisfies readonly TypefestRuleName[];

const tsExtrasTypeGuardRuleNames = [
    "prefer-ts-extras-array-includes",
    "prefer-ts-extras-assert-defined",
    "prefer-ts-extras-assert-error",
    "prefer-ts-extras-assert-present",
    "prefer-ts-extras-is-defined",
    "prefer-ts-extras-is-defined-filter",
    "prefer-ts-extras-is-empty",
    "prefer-ts-extras-is-finite",
    "prefer-ts-extras-is-infinite",
    "prefer-ts-extras-is-integer",
    "prefer-ts-extras-is-present",
    "prefer-ts-extras-is-present-filter",
    "prefer-ts-extras-is-safe-integer",
    "prefer-ts-extras-key-in",
    "prefer-ts-extras-not",
    "prefer-ts-extras-object-has-in",
    "prefer-ts-extras-object-has-own",
    "prefer-ts-extras-safe-cast-to",
    "prefer-ts-extras-set-has",
] as const satisfies readonly TypefestRuleName[];

const tsExtrasUtilityRuleNames = [
    "prefer-ts-extras-array-at",
    "prefer-ts-extras-array-concat",
    "prefer-ts-extras-array-first",
    "prefer-ts-extras-array-join",
    "prefer-ts-extras-array-last",
    "prefer-ts-extras-as-writable",
    "prefer-ts-extras-object-entries",
    "prefer-ts-extras-object-from-entries",
    "prefer-ts-extras-object-keys",
    "prefer-ts-extras-object-values",
    "prefer-ts-extras-string-split",
] as const satisfies readonly TypefestRuleName[];

const tsExtrasExperimentalRuleNames = [
    "prefer-ts-extras-array-find",
    "prefer-ts-extras-array-find-last",
    "prefer-ts-extras-array-find-last-index",
    "prefer-ts-extras-is-equal-type",
] as const satisfies readonly TypefestRuleName[];

const minimalRuleNames = [
    "prefer-type-fest-arrayable",
    "prefer-type-fest-except",
    "prefer-type-fest-json-array",
    "prefer-type-fest-json-object",
    "prefer-type-fest-json-primitive",
    "prefer-type-fest-json-value",
    "prefer-type-fest-primitive",
    "prefer-type-fest-promisable",
    "prefer-type-fest-unknown-record",
    "prefer-ts-extras-is-defined-filter",
    "prefer-ts-extras-is-present-filter",
] as const satisfies readonly TypefestRuleName[];

const recommendedRuleNames = uniqueRuleNames([
    ...typeFestTypesRuleNames,
    ...tsExtrasTypeGuardRuleNames,
]);

const strictRuleNames = uniqueRuleNames([
    ...recommendedRuleNames,
    ...tsExtrasUtilityRuleNames,
]);

const allRuleNames = uniqueRuleNames([
    ...strictRuleNames,
    ...tsExtrasExperimentalRuleNames,
]);

/**
 * Apply parser and plugin metadata required by all plugin presets.
 *
 * @param config - Preset-specific config fragment.
 * @param plugin - Plugin object registered under the `typefest` namespace.
 *
 * @returns Normalized preset config.
 */
function withTypefestPlugin(
    config: TypefestPresetConfig,
    plugin: ESLint.Plugin
): TypefestPresetConfig {
    const languageOptions: FlatLanguageOptions = config.languageOptions ?? {};

    if (typeScriptParser) {
        languageOptions["parser"] ??=
            typeScriptParser as FlatLanguageOptions["parser"];
        languageOptions["parserOptions"] ??= {
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

const pluginForConfigs: ESLint.Plugin = {
    rules: typefestEslintRules,
};

/**
 * Flat config presets distributed by eslint-plugin-typefest.
 */
const typefestConfigs = {
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

/**
 * Runtime type for {@link typefestConfigs}.
 */
export type TypefestConfigs = typeof typefestConfigs;

/**
 * Main plugin object exported for ESLint consumption.
 */
const typefestPlugin = {
    configs: typefestConfigs,
    meta: {
        name: "eslint-plugin-typefest",
        version: getPackageVersion(packageJson),
    },
    processors: {},
    rules: typefestEslintRules,
} satisfies TypefestPluginContract;

/**
 * Runtime type for the plugin default export.
 */
export type TypefestPlugin = typeof typefestPlugin;

/**
 * Default plugin export consumed by ESLint flat config.
 */
export default typefestPlugin;
