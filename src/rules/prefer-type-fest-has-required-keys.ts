import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-has-required-keys`.
 */
import { createPreferTypeFestHasKeysRule } from "../_internal/prefer-type-fest-has-keys-rule.js";

/** ESLint rule definition for `prefer-type-fest-has-required-keys`. */
const preferTypeFestHasRequiredKeysRule: TSESLint.RuleModule<
    string,
    UnknownArray
> = createPreferTypeFestHasKeysRule({
    hasKeysTypeName: "HasRequiredKeys",
    keysOfTypeName: "RequiredKeysOf",
    messageId: "preferHasRequiredKeys",
    ruleName: "prefer-type-fest-has-required-keys",
});

export default preferTypeFestHasRequiredKeysRule;
