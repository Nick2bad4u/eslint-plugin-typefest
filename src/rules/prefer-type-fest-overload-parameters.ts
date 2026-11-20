/** @packageDocumentation Prefer Type-fest's OverloadParameters for overload extraction. */
import { createPreferTypeFestOverloadRule } from "../_internal/prefer-type-fest-overload-rule.js";

/** Rule definition for OverloadParameters. */
const rule: ReturnType<typeof createPreferTypeFestOverloadRule> =
    createPreferTypeFestOverloadRule("parameters");

export default rule;
