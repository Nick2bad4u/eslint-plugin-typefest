import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-readonly-keys-of`.
 */
import { createPreferTypeFestKeysOfRule } from "../_internal/prefer-type-fest-keys-of-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-readonly-keys-of`.
 */
const preferTypeFestReadonlyKeysOfRule: TSESLint.RuleModule<
    string,
    UnknownArray
> = createPreferTypeFestKeysOfRule({
    keyKind: "readonly",
    messageId: "preferReadonlyKeysOf",
    preferredTypeName: "ReadonlyKeysOf",
    ruleName: "prefer-type-fest-readonly-keys-of",
    sourcePattern: {
        guardTypeName: "IsReadonlyKeyOf",
        kind: "mapped-guard",
    },
});

export default preferTypeFestReadonlyKeysOfRule;
