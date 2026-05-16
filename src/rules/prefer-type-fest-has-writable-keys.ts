import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-has-writable-keys`.
 */
import { createPreferTypeFestHasKeysRule } from "../_internal/prefer-type-fest-has-keys-rule.js";

/** ESLint rule definition for `prefer-type-fest-has-writable-keys`. */
const preferTypeFestHasWritableKeysRule: TSESLint.RuleModule<
    string,
    UnknownArray
> = createPreferTypeFestHasKeysRule({
    hasKeysTypeName: "HasWritableKeys",
    keysOfTypeName: "WritableKeysOf",
    messageId: "preferHasWritableKeys",
    ruleName: "prefer-type-fest-has-writable-keys",
});

export default preferTypeFestHasWritableKeysRule;
