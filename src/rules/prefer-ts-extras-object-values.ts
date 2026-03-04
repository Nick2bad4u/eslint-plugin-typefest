import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { getIdentifierMemberCall } from "../_internal/member-call.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-values`.
 */
import {
    createTypedRule,
    isGlobalIdentifierNamed,
} from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-object-values`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasObjectValuesRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            return {
                CallExpression(node) {
                    const objectValuesCall = getIdentifierMemberCall({
                        memberName: "values",
                        node,
                        objectName: "Object",
                    });

                    if (
                        objectValuesCall === null ||
                        !isGlobalIdentifierNamed(
                            context,
                            objectValuesCall.callee.object,
                            "Object"
                        )
                    ) {
                        return;
                    }

                    context.report({
                        fix: createSafeValueReferenceReplacementFix({
                            context,
                            importedName: "objectValues",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                            targetNode: objectValuesCall.callee,
                        }),
                        messageId: "preferTsExtrasObjectValues",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras objectValues over Object.values for stronger value inference.",
                frozen: false,
                recommended: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-values",
            },
            fixable: "code",
            messages: {
                preferTsExtrasObjectValues:
                    "Prefer `objectValues` from `ts-extras` over `Object.values(...)` for stronger value inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-values",
    });

/**
 * Default export for the `prefer-ts-extras-object-values` rule module.
 */
export default preferTsExtrasObjectValuesRule;
