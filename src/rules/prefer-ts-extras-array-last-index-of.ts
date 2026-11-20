/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-last-index-of`.
 */
import { createNativeSearchListener } from "../_internal/native-search-listener.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** ESLint rule definition for `prefer-ts-extras-array-last-index-of`. */
const preferTsExtrasArrayLastIndexOfRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return createNativeSearchListener(
                context,
                "lastIndexOf",
                "preferTsExtrasArrayLastIndexOf"
            );
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras arrayLastIndexOf over native Array.prototype.lastIndexOf calls.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                requiresUpstream: "ts-extras@2",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-last-index-of",
            },
            messages: {
                preferTsExtrasArrayLastIndexOf:
                    "Consider using `arrayLastIndexOf` from `ts-extras` for this Array.prototype.lastIndexOf call.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-last-index-of",
    });

export default preferTsExtrasArrayLastIndexOfRule;
