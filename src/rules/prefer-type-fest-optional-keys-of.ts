import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-optional-keys-of`.
 */
import { createPreferTypeFestKeysOfRule } from "../_internal/prefer-type-fest-keys-of-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-optional-keys-of`.
 */
const preferTypeFestOptionalKeysOfRule: TSESLint.RuleModule<
    string,
    UnknownArray
> = createPreferTypeFestKeysOfRule({
    keyKind: "optional",
    messageId: "preferOptionalKeysOf",
    preferredTypeName: "OptionalKeysOf",
    ruleName: "prefer-type-fest-optional-keys-of",
    sourcePattern: {
        guardTypeName: "IsOptionalKeyOf",
        kind: "mapped-guard",
    },
});

export default preferTypeFestOptionalKeysOfRule;
