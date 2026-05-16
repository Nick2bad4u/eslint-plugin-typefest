import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-required-keys-of`.
 */
import { createPreferTypeFestKeysOfRule } from "../_internal/prefer-type-fest-keys-of-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-required-keys-of`.
 */
const preferTypeFestRequiredKeysOfRule: TSESLint.RuleModule<
    string,
    UnknownArray
> = createPreferTypeFestKeysOfRule({
    keyKind: "required",
    messageId: "preferRequiredKeysOf",
    preferredTypeName: "RequiredKeysOf",
    ruleName: "prefer-type-fest-required-keys-of",
    sourcePattern: {
        keysOfTypeName: "OptionalKeysOf",
        kind: "exclude-keys",
    },
});

export default preferTypeFestRequiredKeysOfRule;
