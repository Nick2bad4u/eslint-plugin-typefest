import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-has-readonly-keys`.
 */
import { createPreferTypeFestHasKeysRule } from "../_internal/prefer-type-fest-has-keys-rule.js";

/** ESLint rule definition for `prefer-type-fest-has-readonly-keys`. */
const preferTypeFestHasReadonlyKeysRule: TSESLint.RuleModule<
    string,
    UnknownArray
> = createPreferTypeFestHasKeysRule({
    hasKeysTypeName: "HasReadonlyKeys",
    keysOfTypeName: "ReadonlyKeysOf",
    messageId: "preferHasReadonlyKeys",
    ruleName: "prefer-type-fest-has-readonly-keys",
});

export default preferTypeFestHasReadonlyKeysRule;
