import { createRequire } from "node:module";
import type { ESLint, Linter } from "eslint";

import preferTsExtrasIsDefinedFilterRule from "./rules/prefer-ts-extras-is-defined-filter.js";
import preferTsExtrasIsPresentFilterRule from "./rules/prefer-ts-extras-is-present-filter.js";
import preferTsExtrasArrayAtRule from "./rules/prefer-ts-extras-array-at.js";
import preferTsExtrasArrayConcatRule from "./rules/prefer-ts-extras-array-concat.js";
import preferTsExtrasArrayFindRule from "./rules/prefer-ts-extras-array-find.js";
import preferTsExtrasArrayFindLastRule from "./rules/prefer-ts-extras-array-find-last.js";
import preferTsExtrasArrayFindLastIndexRule from "./rules/prefer-ts-extras-array-find-last-index.js";
import preferTsExtrasArrayFirstRule from "./rules/prefer-ts-extras-array-first.js";
import preferTsExtrasArrayIncludesRule from "./rules/prefer-ts-extras-array-includes.js";
import preferTsExtrasArrayJoinRule from "./rules/prefer-ts-extras-array-join.js";
import preferTsExtrasArrayLastRule from "./rules/prefer-ts-extras-array-last.js";
import preferTsExtrasAssertDefinedRule from "./rules/prefer-ts-extras-assert-defined.js";
import preferTsExtrasAssertErrorRule from "./rules/prefer-ts-extras-assert-error.js";
import preferTsExtrasAssertPresentRule from "./rules/prefer-ts-extras-assert-present.js";
import preferTsExtrasIsFiniteRule from "./rules/prefer-ts-extras-is-finite.js";
import preferTsExtrasIsEmptyRule from "./rules/prefer-ts-extras-is-empty.js";
import preferTsExtrasIsInfiniteRule from "./rules/prefer-ts-extras-is-infinite.js";
import preferTsExtrasIsIntegerRule from "./rules/prefer-ts-extras-is-integer.js";
import preferTsExtrasIsSafeIntegerRule from "./rules/prefer-ts-extras-is-safe-integer.js";
import preferTsExtrasKeyInRule from "./rules/prefer-ts-extras-key-in.js";
import preferTsExtrasObjectEntriesRule from "./rules/prefer-ts-extras-object-entries.js";
import preferTsExtrasObjectFromEntriesRule from "./rules/prefer-ts-extras-object-from-entries.js";
import preferTsExtrasObjectHasInRule from "./rules/prefer-ts-extras-object-has-in.js";
import preferTsExtrasObjectHasOwnRule from "./rules/prefer-ts-extras-object-has-own.js";
import preferTsExtrasObjectKeysRule from "./rules/prefer-ts-extras-object-keys.js";
import preferTsExtrasNotRule from "./rules/prefer-ts-extras-not.js";
import preferTsExtrasObjectValuesRule from "./rules/prefer-ts-extras-object-values.js";
import preferTsExtrasSetHasRule from "./rules/prefer-ts-extras-set-has.js";
import preferTsExtrasStringSplitRule from "./rules/prefer-ts-extras-string-split.js";
import preferTypeFestAsyncReturnTypeRule from "./rules/prefer-type-fest-async-return-type.js";
import preferTypeFestArrayableRule from "./rules/prefer-type-fest-arrayable.js";
import preferTypeFestConditionalPickRule from "./rules/prefer-type-fest-conditional-pick.js";
import preferTypeFestExceptRule from "./rules/prefer-type-fest-except.js";
import preferTypeFestIfRule from "./rules/prefer-type-fest-if.js";
import preferTypeFestIterableElementRule from "./rules/prefer-type-fest-iterable-element.js";
import preferTypeFestJsonArrayRule from "./rules/prefer-type-fest-json-array.js";
import preferTypeFestJsonObjectRule from "./rules/prefer-type-fest-json-object.js";
import preferTypeFestJsonPrimitiveRule from "./rules/prefer-type-fest-json-primitive.js";
import preferTypeFestJsonValueRule from "./rules/prefer-type-fest-json-value.js";
import preferTypeFestKeysOfUnionRule from "./rules/prefer-type-fest-keys-of-union.js";
import preferTypeFestNonEmptyTupleRule from "./rules/prefer-type-fest-non-empty-tuple.js";
import preferTypeFestRequireExactlyOneRule from "./rules/prefer-type-fest-require-exactly-one.js";
import preferTypeFestRequireOneOrNoneRule from "./rules/prefer-type-fest-require-one-or-none.js";
import preferTypeFestPromisableRule from "./rules/prefer-type-fest-promisable.js";
import preferTypeFestPrimitiveRule from "./rules/prefer-type-fest-primitive.js";
import preferTypeFestSchemaRule from "./rules/prefer-type-fest-schema.js";
import preferTypeFestSetOptionalRule from "./rules/prefer-type-fest-set-optional.js";
import preferTypeFestSimplifyRule from "./rules/prefer-type-fest-simplify.js";
import preferTypeFestTaggedBrandsRule from "./rules/prefer-type-fest-tagged-brands.js";
import preferTypeFestTupleOfRule from "./rules/prefer-type-fest-tuple-of.js";
import preferTypeFestUnwrapTaggedRule from "./rules/prefer-type-fest-unwrap-tagged.js";
import preferTypeFestUnknownArrayRule from "./rules/prefer-type-fest-unknown-array.js";
import preferTypeFestUnknownMapRule from "./rules/prefer-type-fest-unknown-map.js";
import preferTypeFestUnknownRecordRule from "./rules/prefer-type-fest-unknown-record.js";
import preferTypeFestUnknownSetRule from "./rules/prefer-type-fest-unknown-set.js";
import preferTypeFestValueOfRule from "./rules/prefer-type-fest-value-of.js";
import preferTypeFestWritableRule from "./rules/prefer-type-fest-writable.js";

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
        "prefer-ts-extras-array-first": preferTsExtrasArrayFirstRule,
        "prefer-ts-extras-array-includes": preferTsExtrasArrayIncludesRule,
        "prefer-ts-extras-array-join": preferTsExtrasArrayJoinRule,
        "prefer-ts-extras-array-last": preferTsExtrasArrayLastRule,
        "prefer-ts-extras-assert-defined": preferTsExtrasAssertDefinedRule,
        "prefer-ts-extras-assert-error": preferTsExtrasAssertErrorRule,
        "prefer-ts-extras-assert-present": preferTsExtrasAssertPresentRule,
        "prefer-ts-extras-is-defined-filter": preferTsExtrasIsDefinedFilterRule,
        "prefer-ts-extras-is-empty": preferTsExtrasIsEmptyRule,
        "prefer-ts-extras-is-finite": preferTsExtrasIsFiniteRule,
        "prefer-ts-extras-is-infinite": preferTsExtrasIsInfiniteRule,
        "prefer-ts-extras-is-integer": preferTsExtrasIsIntegerRule,
        "prefer-ts-extras-is-present-filter": preferTsExtrasIsPresentFilterRule,
        "prefer-ts-extras-is-safe-integer": preferTsExtrasIsSafeIntegerRule,
        "prefer-ts-extras-key-in": preferTsExtrasKeyInRule,
        "prefer-ts-extras-object-entries": preferTsExtrasObjectEntriesRule,
        "prefer-ts-extras-object-from-entries":
            preferTsExtrasObjectFromEntriesRule,
        "prefer-ts-extras-object-has-in": preferTsExtrasObjectHasInRule,
        "prefer-ts-extras-object-has-own": preferTsExtrasObjectHasOwnRule,
        "prefer-ts-extras-object-keys": preferTsExtrasObjectKeysRule,
        "prefer-ts-extras-not": preferTsExtrasNotRule,
        "prefer-ts-extras-object-values": preferTsExtrasObjectValuesRule,
        "prefer-ts-extras-set-has": preferTsExtrasSetHasRule,
        "prefer-ts-extras-string-split": preferTsExtrasStringSplitRule,
        "prefer-type-fest-async-return-type": preferTypeFestAsyncReturnTypeRule,
        "prefer-type-fest-arrayable": preferTypeFestArrayableRule,
        "prefer-type-fest-conditional-pick": preferTypeFestConditionalPickRule,
        "prefer-type-fest-except": preferTypeFestExceptRule,
        "prefer-type-fest-if": preferTypeFestIfRule,
        "prefer-type-fest-iterable-element": preferTypeFestIterableElementRule,
        "prefer-type-fest-json-array": preferTypeFestJsonArrayRule,
        "prefer-type-fest-json-object": preferTypeFestJsonObjectRule,
        "prefer-type-fest-json-primitive": preferTypeFestJsonPrimitiveRule,
        "prefer-type-fest-json-value": preferTypeFestJsonValueRule,
        "prefer-type-fest-keys-of-union": preferTypeFestKeysOfUnionRule,
        "prefer-type-fest-non-empty-tuple": preferTypeFestNonEmptyTupleRule,
        "prefer-type-fest-require-exactly-one":
            preferTypeFestRequireExactlyOneRule,
        "prefer-type-fest-require-one-or-none":
            preferTypeFestRequireOneOrNoneRule,
        "prefer-type-fest-primitive": preferTypeFestPrimitiveRule,
        "prefer-type-fest-promisable": preferTypeFestPromisableRule,
        "prefer-type-fest-schema": preferTypeFestSchemaRule,
        "prefer-type-fest-set-optional": preferTypeFestSetOptionalRule,
        "prefer-type-fest-simplify": preferTypeFestSimplifyRule,
        "prefer-type-fest-tagged-brands": preferTypeFestTaggedBrandsRule,
        "prefer-type-fest-tuple-of": preferTypeFestTupleOfRule,
        "prefer-type-fest-unwrap-tagged": preferTypeFestUnwrapTaggedRule,
        "prefer-type-fest-unknown-array": preferTypeFestUnknownArrayRule,
        "prefer-type-fest-unknown-map": preferTypeFestUnknownMapRule,
        "prefer-type-fest-unknown-record": preferTypeFestUnknownRecordRule,
        "prefer-type-fest-unknown-set": preferTypeFestUnknownSetRule,
        "prefer-type-fest-value-of": preferTypeFestValueOfRule,
        "prefer-type-fest-writable": preferTypeFestWritableRule,
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

const minimalRuleNames = [
    "prefer-type-fest-async-return-type",
    "prefer-type-fest-arrayable",
    "prefer-type-fest-conditional-pick",
    "prefer-type-fest-except",
    "prefer-type-fest-if",
    "prefer-type-fest-iterable-element",
    "prefer-type-fest-json-array",
    "prefer-type-fest-json-object",
    "prefer-type-fest-json-primitive",
    "prefer-type-fest-json-value",
    "prefer-type-fest-keys-of-union",
    "prefer-type-fest-non-empty-tuple",
    "prefer-type-fest-require-exactly-one",
    "prefer-type-fest-require-one-or-none",
    "prefer-type-fest-primitive",
    "prefer-type-fest-promisable",
    "prefer-type-fest-schema",
    "prefer-type-fest-set-optional",
    "prefer-type-fest-simplify",
    "prefer-type-fest-tagged-brands",
    "prefer-type-fest-tuple-of",
    "prefer-type-fest-unwrap-tagged",
    "prefer-type-fest-unknown-array",
    "prefer-type-fest-unknown-map",
    "prefer-type-fest-unknown-record",
    "prefer-type-fest-unknown-set",
    "prefer-type-fest-value-of",
    "prefer-type-fest-writable",
] as const;

const safeRuleNames = [
    ...minimalRuleNames,
    "prefer-ts-extras-is-defined-filter",
    "prefer-ts-extras-is-present-filter",
    "prefer-ts-extras-array-at",
    "prefer-ts-extras-array-concat",
    "prefer-ts-extras-array-find",
    "prefer-ts-extras-array-find-last",
    "prefer-ts-extras-array-find-last-index",
    "prefer-ts-extras-array-first",
    "prefer-ts-extras-array-includes",
    "prefer-ts-extras-array-join",
    "prefer-ts-extras-array-last",
    "prefer-ts-extras-is-empty",
    "prefer-ts-extras-is-finite",
    "prefer-ts-extras-is-infinite",
    "prefer-ts-extras-is-integer",
    "prefer-ts-extras-is-safe-integer",
    "prefer-ts-extras-key-in",
    "prefer-ts-extras-object-entries",
    "prefer-ts-extras-object-from-entries",
    "prefer-ts-extras-object-has-in",
    "prefer-ts-extras-object-has-own",
    "prefer-ts-extras-object-keys",
    "prefer-ts-extras-not",
    "prefer-ts-extras-object-values",
    "prefer-ts-extras-set-has",
    "prefer-ts-extras-string-split",
] as const;

const recommendedRuleNames = [
    ...safeRuleNames,
    "prefer-ts-extras-assert-defined",
    "prefer-ts-extras-assert-error",
    "prefer-ts-extras-assert-present",
] as const;

const strictRuleNames = [...recommendedRuleNames] as const;

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

const flatMinimalConfig = withTypefestPlugin({
    name: "typefest:flat/minimal",
    rules: errorRulesFor(minimalRuleNames),
});

const flatSafeConfig = withTypefestPlugin({
    name: "typefest:flat/safe",
    rules: errorRulesFor(safeRuleNames),
});

const flatDefaultConfig = withTypefestPlugin({
    name: "typefest:flat/default",
    rules: errorRulesFor(safeRuleNames),
});

const flatRecommendedConfig = withTypefestPlugin({
    name: "typefest:flat/recommended",
    rules: errorRulesFor(recommendedRuleNames),
});

const flatStrictConfig = withTypefestPlugin({
    name: "typefest:flat/strict",
    rules: errorRulesFor(strictRuleNames),
});

const unscopedAllConfig = withTypefestPlugin({
    name: "typefest:all",
    rules: allRules,
});

const unscopedMinimalConfig = withTypefestPlugin({
    name: "typefest:minimal",
    rules: errorRulesFor(minimalRuleNames),
});

const unscopedSafeConfig = withTypefestPlugin({
    name: "typefest:safe",
    rules: errorRulesFor(safeRuleNames),
});

const unscopedDefaultConfig = withTypefestPlugin({
    name: "typefest:default",
    rules: errorRulesFor(safeRuleNames),
});

const unscopedRecommendedConfig = withTypefestPlugin({
    name: "typefest:recommended",
    rules: errorRulesFor(recommendedRuleNames),
});

const unscopedStrictConfig = withTypefestPlugin({
    name: "typefest:strict",
    rules: errorRulesFor(strictRuleNames),
});

(
    typefestPlugin as unknown as {
        configs: Record<string, FlatConfig>;
    }
).configs = {
    all: unscopedAllConfig,
    assertive: unscopedRecommendedConfig,
    complete: unscopedAllConfig,
    core: unscopedMinimalConfig,
    default: unscopedDefaultConfig,
    "flat/assertive": flatRecommendedConfig,
    "flat/all": flatAllConfig,
    "flat/complete": flatAllConfig,
    "flat/core": flatMinimalConfig,
    "flat/default": flatDefaultConfig,
    "flat/minimal": flatMinimalConfig,
    "flat/recommended": flatRecommendedConfig,
    "flat/runtime": flatSafeConfig,
    "flat/safe": flatSafeConfig,
    "flat/strict": flatStrictConfig,
    minimal: unscopedMinimalConfig,
    recommended: unscopedRecommendedConfig,
    runtime: unscopedSafeConfig,
    safe: unscopedSafeConfig,
    strict: unscopedStrictConfig,
};

export default typefestPlugin as unknown as ESLint.Plugin;
