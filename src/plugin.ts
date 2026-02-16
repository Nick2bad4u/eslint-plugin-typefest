import { createRequire } from "node:module";
import type { ESLint, Linter } from "eslint";

import preferTsExtrasIsDefinedFilterRule from "./rules/prefer-ts-extras-is-defined-filter.js";
import preferTsExtrasIsPresentFilterRule from "./rules/prefer-ts-extras-is-present-filter.js";
import preferTsExtrasArrayAtRule from "./rules/prefer-ts-extras-array-at.js";
import preferTsExtrasArrayConcatRule from "./rules/prefer-ts-extras-array-concat.js";
import preferTsExtrasArrayFindRule from "./rules/prefer-ts-extras-array-find.js";
import preferTsExtrasArrayFindLastRule from "./rules/prefer-ts-extras-array-find-last.js";
import preferTsExtrasArrayFindLastIndexRule from "./rules/prefer-ts-extras-array-find-last-index.js";
import preferTsExtrasArrayIncludesRule from "./rules/prefer-ts-extras-array-includes.js";
import preferTsExtrasArrayJoinRule from "./rules/prefer-ts-extras-array-join.js";
import preferTsExtrasIsFiniteRule from "./rules/prefer-ts-extras-is-finite.js";
import preferTsExtrasIsIntegerRule from "./rules/prefer-ts-extras-is-integer.js";
import preferTsExtrasIsSafeIntegerRule from "./rules/prefer-ts-extras-is-safe-integer.js";
import preferTsExtrasKeyInRule from "./rules/prefer-ts-extras-key-in.js";
import preferTsExtrasObjectEntriesRule from "./rules/prefer-ts-extras-object-entries.js";
import preferTsExtrasObjectFromEntriesRule from "./rules/prefer-ts-extras-object-from-entries.js";
import preferTsExtrasObjectHasOwnRule from "./rules/prefer-ts-extras-object-has-own.js";
import preferTsExtrasObjectKeysRule from "./rules/prefer-ts-extras-object-keys.js";
import preferTsExtrasObjectValuesRule from "./rules/prefer-ts-extras-object-values.js";
import preferTsExtrasSetHasRule from "./rules/prefer-ts-extras-set-has.js";
import preferTsExtrasStringSplitRule from "./rules/prefer-ts-extras-string-split.js";
import preferTypeFestAsyncReturnTypeRule from "./rules/prefer-type-fest-async-return-type.js";
import preferTypeFestExceptRule from "./rules/prefer-type-fest-except.js";
import preferTypeFestJsonValueRule from "./rules/prefer-type-fest-json-value.js";
import preferTypeFestPromisableRule from "./rules/prefer-type-fest-promisable.js";
import preferTypeFestTaggedBrandsRule from "./rules/prefer-type-fest-tagged-brands.js";
import preferTypeFestUnknownArrayRule from "./rules/prefer-type-fest-unknown-array.js";
import preferTypeFestUnknownMapRule from "./rules/prefer-type-fest-unknown-map.js";
import preferTypeFestUnknownRecordRule from "./rules/prefer-type-fest-unknown-record.js";
import preferTypeFestUnknownSetRule from "./rules/prefer-type-fest-unknown-set.js";
import preferTypeFestValueOfRule from "./rules/prefer-type-fest-value-of.js";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version: string };

const DEFAULT_RULE_DOCS_URL_BASE =
    "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules";

const typefestPlugin = {
    meta: {
        name: "eslint-plugin-typefest",
        version: packageJson.version,
    },
    rules: {
        "prefer-ts-extras-array-at": preferTsExtrasArrayAtRule,
        "prefer-ts-extras-array-concat": preferTsExtrasArrayConcatRule,
        "prefer-ts-extras-array-find": preferTsExtrasArrayFindRule,
        "prefer-ts-extras-array-find-last": preferTsExtrasArrayFindLastRule,
        "prefer-ts-extras-array-find-last-index":
            preferTsExtrasArrayFindLastIndexRule,
        "prefer-ts-extras-array-includes": preferTsExtrasArrayIncludesRule,
        "prefer-ts-extras-array-join": preferTsExtrasArrayJoinRule,
        "prefer-ts-extras-is-defined-filter": preferTsExtrasIsDefinedFilterRule,
        "prefer-ts-extras-is-finite": preferTsExtrasIsFiniteRule,
        "prefer-ts-extras-is-integer": preferTsExtrasIsIntegerRule,
        "prefer-ts-extras-is-present-filter": preferTsExtrasIsPresentFilterRule,
        "prefer-ts-extras-is-safe-integer": preferTsExtrasIsSafeIntegerRule,
        "prefer-ts-extras-key-in": preferTsExtrasKeyInRule,
        "prefer-ts-extras-object-entries": preferTsExtrasObjectEntriesRule,
        "prefer-ts-extras-object-from-entries": preferTsExtrasObjectFromEntriesRule,
        "prefer-ts-extras-object-has-own": preferTsExtrasObjectHasOwnRule,
        "prefer-ts-extras-object-keys": preferTsExtrasObjectKeysRule,
        "prefer-ts-extras-object-values": preferTsExtrasObjectValuesRule,
        "prefer-ts-extras-set-has": preferTsExtrasSetHasRule,
        "prefer-ts-extras-string-split": preferTsExtrasStringSplitRule,
        "prefer-type-fest-async-return-type": preferTypeFestAsyncReturnTypeRule,
        "prefer-type-fest-except": preferTypeFestExceptRule,
        "prefer-type-fest-json-value": preferTypeFestJsonValueRule,
        "prefer-type-fest-promisable": preferTypeFestPromisableRule,
        "prefer-type-fest-tagged-brands": preferTypeFestTaggedBrandsRule,
        "prefer-type-fest-unknown-array": preferTypeFestUnknownArrayRule,
        "prefer-type-fest-unknown-map": preferTypeFestUnknownMapRule,
        "prefer-type-fest-unknown-record": preferTypeFestUnknownRecordRule,
        "prefer-type-fest-unknown-set": preferTypeFestUnknownSetRule,
        "prefer-type-fest-value-of": preferTypeFestValueOfRule,
    },
};

type RuleWithDocs = {
    meta?: {
        docs?: {
            url?: string;
        };
    };
};

const pluginRules = typefestPlugin.rules as Record<string, RuleWithDocs>;

for (const [ruleName, rule] of Object.entries(pluginRules)) {
    if (rule.meta?.docs) {
        rule.meta.docs.url ??= `${DEFAULT_RULE_DOCS_URL_BASE}/${ruleName}.md`;
    }
}

type FlatConfig = Linter.Config;
type RulesConfig = NonNullable<FlatConfig["rules"]>;
const ERROR_SEVERITY = "error" as const;
const allRules: RulesConfig = {};

for (const ruleName of Object.keys(pluginRules)) {
    allRules[`typefest/${ruleName}`] = ERROR_SEVERITY;
}

function errorRulesFor(ruleNames: readonly string[]): RulesConfig {
    const rules: RulesConfig = {};

    for (const ruleName of ruleNames) {
        rules[`typefest/${ruleName}`] = ERROR_SEVERITY;
    }

    return rules;
}

const recommendedRuleNames = [
    "prefer-type-fest-async-return-type",
    "prefer-type-fest-except",
    "prefer-type-fest-promisable",
    "prefer-type-fest-unknown-array",
    "prefer-type-fest-unknown-map",
    "prefer-type-fest-unknown-record",
    "prefer-type-fest-unknown-set",
    "prefer-type-fest-value-of",
    "prefer-ts-extras-is-defined-filter",
    "prefer-ts-extras-is-present-filter",
    "prefer-ts-extras-array-at",
    "prefer-ts-extras-array-concat",
    "prefer-ts-extras-array-find",
    "prefer-ts-extras-array-find-last",
    "prefer-ts-extras-array-find-last-index",
    "prefer-ts-extras-array-includes",
    "prefer-ts-extras-array-join",
    "prefer-ts-extras-is-finite",
    "prefer-ts-extras-is-integer",
    "prefer-ts-extras-is-safe-integer",
    "prefer-ts-extras-key-in",
    "prefer-ts-extras-object-entries",
    "prefer-ts-extras-object-from-entries",
    "prefer-ts-extras-object-keys",
    "prefer-ts-extras-object-values",
    "prefer-ts-extras-set-has",
    "prefer-ts-extras-string-split",
] as const;

function withTypefestPlugin(config: FlatConfig): FlatConfig {
    return {
        ...config,
        plugins: {
            ...config.plugins,
            typefest: typefestPlugin as unknown as ESLint.Plugin,
        },
    };
}

const flatAllConfig = withTypefestPlugin({
    name: "typefest:flat/all",
    rules: allRules,
});

const flatDefaultConfig = withTypefestPlugin({
    name: "typefest:flat/default",
    rules: errorRulesFor(recommendedRuleNames),
});

const flatRecommendedConfig = withTypefestPlugin({
    name: "typefest:flat/recommended",
    rules: errorRulesFor(recommendedRuleNames),
});

const unscopedAllConfig = withTypefestPlugin({
    name: "typefest:all",
    rules: allRules,
});

const unscopedDefaultConfig = withTypefestPlugin({
    name: "typefest:default",
    rules: errorRulesFor(recommendedRuleNames),
});

const unscopedRecommendedConfig = withTypefestPlugin({
    name: "typefest:recommended",
    rules: errorRulesFor(recommendedRuleNames),
});

(
    typefestPlugin as unknown as {
        configs: Record<string, FlatConfig>;
    }
).configs = {
    all: unscopedAllConfig,
    default: unscopedDefaultConfig,
    "flat/all": flatAllConfig,
    "flat/default": flatDefaultConfig,
    "flat/recommended": flatRecommendedConfig,
    recommended: unscopedRecommendedConfig,
};

export default typefestPlugin as unknown as ESLint.Plugin;
