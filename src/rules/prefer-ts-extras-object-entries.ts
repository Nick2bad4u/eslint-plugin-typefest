import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { getIdentifierMemberCall } from "../_internal/member-call.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-entries`.
 */
import {
    createTypedRule,
    isGlobalIdentifierNamed,
} from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-object-entries`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasObjectEntriesRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            return {
                CallExpression(node) {
                    const objectEntriesCall = getIdentifierMemberCall({
                        memberName: "entries",
                        node,
                        objectName: "Object",
                    });

                    if (
                        objectEntriesCall === null ||
                        !isGlobalIdentifierNamed(
                            context,
                            objectEntriesCall.callee.object,
                            "Object"
                        )
                    ) {
                        return;
                    }

                    context.report({
                        fix: createSafeValueReferenceReplacementFix({
                            context,
                            importedName: "objectEntries",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                            targetNode: objectEntriesCall.callee,
                        }),
                        messageId: "preferTsExtrasObjectEntries",
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
                    "require ts-extras objectEntries over Object.entries for stronger key/value inference.",
                frozen: false,
                recommended: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-entries",
            },
            fixable: "code",
            messages: {
                preferTsExtrasObjectEntries:
                    "Prefer `objectEntries` from `ts-extras` over `Object.entries(...)` for stronger key and value inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-entries",
    });

/**
 * Default export for the `prefer-ts-extras-object-entries` rule module.
 */
export default preferTsExtrasObjectEntriesRule;
