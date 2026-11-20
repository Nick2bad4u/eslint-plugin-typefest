/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-has-at-least`.
 */
import { createArrayLengthGuardListener } from "../_internal/array-length-guard.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Prefer the published hasAtLeast array guard. */
const rule: ReturnType<typeof createTypedRule> = createTypedRule({
    create(context) {
        return createArrayLengthGuardListener(
            context,
            "hasAtLeast",
            "preferTsExtrasHasAtLeast"
        );
    },
    meta: {
        deprecated: false,
        docs: {
            description:
                "require ts-extras hasAtLeast over array length comparisons requiring at least two elements.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: true,
            requiresUpstream: "ts-extras@2",
            typefestConfigs: [
                "typefest.configs.all",
                "typefest.configs.experimental",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-has-at-least",
        },
        messages: {
            preferTsExtrasHasAtLeast:
                "Prefer `hasAtLeast` from `ts-extras` to narrow the array for this length check.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "prefer-ts-extras-has-at-least",
});
export default rule;
