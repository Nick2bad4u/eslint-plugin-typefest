import preferTsExtrasIsDefinedFilterRule from "./rules/prefer-ts-extras-is-defined-filter.mjs";
import preferTsExtrasIsPresentFilterRule from "./rules/prefer-ts-extras-is-present-filter.mjs";
import preferTsExtrasObjectHasOwnRule from "./rules/prefer-ts-extras-object-has-own.mjs";
import preferTypeFestJsonValueRule from "./rules/prefer-type-fest-json-value.mjs";
import preferTypeFestPromisableRule from "./rules/prefer-type-fest-promisable.mjs";
import preferTypeFestTaggedBrandsRule from "./rules/prefer-type-fest-tagged-brands.mjs";
import preferTypeFestUnknownRecordRule from "./rules/prefer-type-fest-unknown-record.mjs";
import preferTypeFestValueOfRule from "./rules/prefer-type-fest-value-of.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageJson = require("./package.json");

const DEFAULT_RULE_DOCS_URL_BASE =
    "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules";

/** @type {import("eslint").ESLint.Plugin} */
const typefestPlugin = /** @type {any} */ ({
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
});

const pluginRules = typefestPlugin.rules ?? {};

for (const [ruleName, rule] of Object.entries(pluginRules)) {
    if (rule.meta?.docs) {
        rule.meta.docs.url ??= `${DEFAULT_RULE_DOCS_URL_BASE}/${ruleName}.md`;
    }
}

const ERROR_SEVERITY = /** @type {const} */ ("error");

/** @typedef {import("@eslint/core").RulesConfig} RulesConfig */
/** @typedef {import("eslint").Linter.Config} FlatConfig */

/** @type {RulesConfig} */
const allRules = {};

for (const ruleName of Object.keys(pluginRules)) {
    allRules[`typefest/${ruleName}`] = ERROR_SEVERITY;
}

/**
 * @param {readonly string[]} ruleNames
 * @returns {RulesConfig}
 */
function errorRulesFor(ruleNames) {
    /** @type {RulesConfig} */
    const rules = {};

    for (const ruleName of ruleNames) {
        rules[`typefest/${ruleName}`] = ERROR_SEVERITY;
    }

    return rules;
}

const recommendedRuleNames = /** @type {const} */ ([
    "prefer-type-fest-promisable",
    "prefer-type-fest-unknown-record",
    "prefer-type-fest-value-of",
    "prefer-ts-extras-is-defined-filter",
    "prefer-ts-extras-is-present-filter",
]);

/**
 * @param {FlatConfig} config
 * @returns {FlatConfig}
 */
function withTypefestPlugin(config) {
    return {
        ...config,
        plugins: {
            ...config.plugins,
            typefest: typefestPlugin,
        },
    };
}

const unscopedAllConfig = withTypefestPlugin({
    name: "typefest:all",
    rules: allRules,
});

const unscopedRecommendedConfig = withTypefestPlugin({
    name: "typefest:recommended",
    rules: errorRulesFor(recommendedRuleNames),
});

const unscopedDefaultConfig = withTypefestPlugin({
    name: "typefest:default",
    rules: errorRulesFor(recommendedRuleNames),
});

const flatAllConfig = withTypefestPlugin({
    name: "typefest:flat/all",
    rules: allRules,
});

const flatRecommendedConfig = withTypefestPlugin({
    name: "typefest:flat/recommended",
    rules: errorRulesFor(recommendedRuleNames),
});

const flatDefaultConfig = withTypefestPlugin({
    name: "typefest:flat/default",
    rules: errorRulesFor(recommendedRuleNames),
});

/** @type {any} */ (typefestPlugin).configs = {
    all: unscopedAllConfig,
    recommended: unscopedRecommendedConfig,
    default: unscopedDefaultConfig,
    "flat/all": flatAllConfig,
    "flat/recommended": flatRecommendedConfig,
    "flat/default": flatDefaultConfig,
};

export default typefestPlugin;
