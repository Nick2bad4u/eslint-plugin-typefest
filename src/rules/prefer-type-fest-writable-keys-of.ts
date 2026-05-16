import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-writable-keys-of`.
 */
import { createPreferTypeFestKeysOfRule } from "../_internal/prefer-type-fest-keys-of-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-writable-keys-of`.
 */
const preferTypeFestWritableKeysOfRule: TSESLint.RuleModule<
    string,
    UnknownArray
> = createPreferTypeFestKeysOfRule({
    keyKind: "writable",
    messageId: "preferWritableKeysOf",
    preferredTypeName: "WritableKeysOf",
    ruleName: "prefer-type-fest-writable-keys-of",
    sourcePattern: {
        keysOfTypeName: "ReadonlyKeysOf",
        kind: "exclude-keys",
    },
});

export default preferTypeFestWritableKeysOfRule;
