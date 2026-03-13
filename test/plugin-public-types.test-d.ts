/**
 * @packageDocumentation
 * Type-level contract tests for public plugin exports.
 */
import type {
    TypefestConfigName,
    TypefestConfigs,
    TypefestPlugin,
    TypefestPresetConfig,
    TypefestRuleId,
    TypefestRuleName,
} from "eslint-plugin-typefest";

import { assertType } from "vitest";

const validConfigName = "recommended-type-checked";

assertType<TypefestConfigName>(validConfigName);
// @ts-expect-error Invalid preset key must not satisfy TypefestConfigName.
assertType<TypefestConfigName>("recommendedTypeChecked");

const validRuleId = "typefest/prefer-type-fest-arrayable";

assertType<TypefestRuleId>(validRuleId);
// @ts-expect-error Rule ids must include the `typefest/` namespace prefix.
assertType<TypefestRuleId>("prefer-type-fest-arrayable");

type RuleNameFromRuleId = TypefestRuleId extends `typefest/${infer RuleName}`
    ? RuleName
    : never;

declare const pluginContract: TypefestPlugin;

assertType<TypefestRuleName>(
    "prefer-type-fest-arrayable" satisfies RuleNameFromRuleId
);
assertType<TypefestPresetConfig>(pluginContract.configs.recommended);
assertType<TypefestPresetConfig>(pluginContract.configs.all);
assertType<TypefestConfigs>(pluginContract.configs);
assertType<string>(pluginContract.meta.name);
assertType<string>(pluginContract.meta.namespace);
