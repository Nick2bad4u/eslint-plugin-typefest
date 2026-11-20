/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-map-has`.
 */
import { createNativeSearchListener } from "../_internal/native-search-listener.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** ESLint rule definition for `prefer-ts-extras-map-has`. */
const preferTsExtrasMapHasRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return createNativeSearchListener(
                context,
                "has",
                "preferTsExtrasMapHas"
            );
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras mapHas over native Map.prototype.has calls.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                requiresUpstream: "ts-extras@2",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-map-has",
            },
            messages: {
                preferTsExtrasMapHas:
                    "Consider using `mapHas` from `ts-extras` for this Map.prototype.has call.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-map-has",
    });

export default preferTsExtrasMapHasRule;
