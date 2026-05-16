import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-has-optional-keys`.
 */
import { createPreferTypeFestHasKeysRule } from "../_internal/prefer-type-fest-has-keys-rule.js";

/** ESLint rule definition for `prefer-type-fest-has-optional-keys`. */
const preferTypeFestHasOptionalKeysRule: TSESLint.RuleModule<
    string,
    UnknownArray
> = createPreferTypeFestHasKeysRule({
    hasKeysTypeName: "HasOptionalKeys",
    keysOfTypeName: "OptionalKeysOf",
    messageId: "preferHasOptionalKeys",
    ruleName: "prefer-type-fest-has-optional-keys",
});

export default preferTypeFestHasOptionalKeysRule;
