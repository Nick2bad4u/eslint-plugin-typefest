/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-string-ends-with`.
 */
import { createNativeSearchListener } from "../_internal/native-search-listener.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** ESLint rule definition for `prefer-ts-extras-string-ends-with`. */
const preferTsExtrasStringEndsWithRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return createNativeSearchListener(
                context,
                "endsWith",
                "preferTsExtrasStringEndsWith"
            );
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras stringEndsWith over native String.prototype.endsWith calls.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                requiresUpstream: "ts-extras@2",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-string-ends-with",
            },
            messages: {
                preferTsExtrasStringEndsWith:
                    "Consider using `stringEndsWith` from `ts-extras` for this String.prototype.endsWith call.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-string-ends-with",
    });

export default preferTsExtrasStringEndsWithRule;
