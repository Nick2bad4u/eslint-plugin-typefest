/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-non-empty`.
 */
import { createArrayLengthGuardListener } from "../_internal/array-length-guard.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Prefer the published isNonEmpty array guard. */
const rule: ReturnType<typeof createTypedRule> = createTypedRule({
    create(context) {
        return createArrayLengthGuardListener(
            context,
            "isNonEmpty",
            "preferTsExtrasIsNonEmpty"
        );
    },
    meta: {
        deprecated: false,
        docs: {
            description:
                "require ts-extras isNonEmpty over nonempty array length comparisons.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: true,
            requiresUpstream: "ts-extras@2",
            typefestConfigs: [
                "typefest.configs.all",
                "typefest.configs.experimental",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-non-empty",
        },
        messages: {
            preferTsExtrasIsNonEmpty:
                "Prefer `isNonEmpty` from `ts-extras` to narrow the array for this length check.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "prefer-ts-extras-is-non-empty",
});
export default rule;
