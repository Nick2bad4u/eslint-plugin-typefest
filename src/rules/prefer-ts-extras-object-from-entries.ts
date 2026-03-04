import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { getIdentifierMemberCall } from "../_internal/member-call.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-from-entries`.
 */
import {
    createTypedRule,
    isGlobalIdentifierNamed,
} from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-object-from-entries`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasObjectFromEntriesRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            return {
                CallExpression(node) {
                    const objectFromEntriesCall = getIdentifierMemberCall({
                        memberName: "fromEntries",
                        node,
                        objectName: "Object",
                    });

                    if (
                        objectFromEntriesCall === null ||
                        !isGlobalIdentifierNamed(
                            context,
                            objectFromEntriesCall.callee.object,
                            "Object"
                        )
                    ) {
                        return;
                    }

                    context.report({
                        fix: createSafeValueReferenceReplacementFix({
                            context,
                            importedName: "objectFromEntries",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                            targetNode: objectFromEntriesCall.callee,
                        }),
                        messageId: "preferTsExtrasObjectFromEntries",
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
                    "require ts-extras objectFromEntries over Object.fromEntries for stronger key/value inference.",
                frozen: false,
                recommended: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-from-entries",
            },
            fixable: "code",
            messages: {
                preferTsExtrasObjectFromEntries:
                    "Prefer `objectFromEntries` from `ts-extras` over `Object.fromEntries(...)` for stronger key and value inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-from-entries",
    });

/**
 * Default export for the `prefer-ts-extras-object-from-entries` rule module.
 */
export default preferTsExtrasObjectFromEntriesRule;
