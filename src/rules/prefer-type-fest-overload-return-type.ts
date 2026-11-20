/** @packageDocumentation Prefer Type-fest's OverloadReturnType for overload extraction. */
import { createPreferTypeFestOverloadRule } from "../_internal/prefer-type-fest-overload-rule.js";

/** Rule definition for OverloadReturnType. */
const rule: ReturnType<typeof createPreferTypeFestOverloadRule> =
    createPreferTypeFestOverloadRule("return-type");

export default rule;
