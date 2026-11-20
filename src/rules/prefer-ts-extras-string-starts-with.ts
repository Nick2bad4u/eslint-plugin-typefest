/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-string-starts-with`.
 */
import { createNativeSearchListener } from "../_internal/native-search-listener.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** ESLint rule definition for `prefer-ts-extras-string-starts-with`. */
const preferTsExtrasStringStartsWithRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return createNativeSearchListener(
                context,
                "startsWith",
                "preferTsExtrasStringStartsWith"
            );
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras stringStartsWith over native String.prototype.startsWith calls.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                requiresUpstream: "ts-extras@2",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-string-starts-with",
            },
            messages: {
                preferTsExtrasStringStartsWith:
                    "Consider using `stringStartsWith` from `ts-extras` for this String.prototype.startsWith call.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-string-starts-with",
    });

export default preferTsExtrasStringStartsWithRule;
