/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-index-of`.
 */
import { createNativeSearchListener } from "../_internal/native-search-listener.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** ESLint rule definition for `prefer-ts-extras-array-index-of`. */
const preferTsExtrasArrayIndexOfRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return createNativeSearchListener(
                context,
                "indexOf",
                "preferTsExtrasArrayIndexOf"
            );
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras arrayIndexOf over native Array.prototype.indexOf calls.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                requiresUpstream: "ts-extras@2",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-index-of",
            },
            messages: {
                preferTsExtrasArrayIndexOf:
                    "Consider using `arrayIndexOf` from `ts-extras` for this Array.prototype.indexOf call.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-index-of",
    });

export default preferTsExtrasArrayIndexOfRule;
