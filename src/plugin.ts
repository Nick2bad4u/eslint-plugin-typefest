import { createRequire } from "node:module";
import type { ESLint, Linter } from "eslint";

import preferTsExtrasIsDefinedFilterRule from "./rules/prefer-ts-extras-is-defined-filter.js";
import preferTsExtrasIsPresentFilterRule from "./rules/prefer-ts-extras-is-present-filter.js";
import preferTsExtrasObjectHasOwnRule from "./rules/prefer-ts-extras-object-has-own.js";
import preferTypeFestJsonValueRule from "./rules/prefer-type-fest-json-value.js";
import preferTypeFestPromisableRule from "./rules/prefer-type-fest-promisable.js";
import preferTypeFestTaggedBrandsRule from "./rules/prefer-type-fest-tagged-brands.js";
import preferTypeFestUnknownRecordRule from "./rules/prefer-type-fest-unknown-record.js";
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
        "prefer-ts-extras-is-defined-filter": preferTsExtrasIsDefinedFilterRule,
        "prefer-ts-extras-is-present-filter": preferTsExtrasIsPresentFilterRule,
        "prefer-ts-extras-object-has-own": preferTsExtrasObjectHasOwnRule,
        "prefer-type-fest-json-value": preferTypeFestJsonValueRule,
        "prefer-type-fest-promisable": preferTypeFestPromisableRule,
        "prefer-type-fest-tagged-brands": preferTypeFestTaggedBrandsRule,
        "prefer-type-fest-unknown-record": preferTypeFestUnknownRecordRule,
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
    "prefer-type-fest-promisable",
    "prefer-type-fest-unknown-record",
    "prefer-type-fest-value-of",
    "prefer-ts-extras-is-defined-filter",
    "prefer-ts-extras-is-present-filter",
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
