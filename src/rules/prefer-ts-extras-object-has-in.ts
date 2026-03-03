/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-has-in`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
import {
    createTypedRule,
    isGlobalIdentifierNamed,
} from "../_internal/typed-rule.js";

/**
 * Detects `Reflect.has(...)` calls that resolve to the global `Reflect` object.
 *
 * @param options - Rule context and call expression candidate.
 *
 * @returns `true` when the call is a non-computed `Reflect.has` invocation
 *   against the global symbol.
 */

const isReflectHasCall = ({
    context,
    node,
}: Readonly<{
    context: TSESLint.RuleContext<string, Readonly<UnknownArray>>;
    node: TSESTree.CallExpression;
}>): boolean => {
    if (node.callee.type !== "MemberExpression" || node.callee.computed) {
        return false;
    }

    return (
        node.callee.object.type === "Identifier" &&
        node.callee.object.name === "Reflect" &&
        isGlobalIdentifierNamed(context, node.callee.object, "Reflect") &&
        node.callee.property.type === "Identifier" &&
        node.callee.property.name === "has"
    );
};

/**
 * ESLint rule definition for `prefer-ts-extras-object-has-in`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasObjectHasInRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            return {
                CallExpression(node) {
                    if (!isReflectHasCall({ context, node })) {
                        return;
                    }

                    if (node.arguments.length < 2) {
                        return;
                    }

                    context.report({
                        fix: createSafeValueReferenceReplacementFix({
                            context,
                            importedName: "objectHasIn",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                            targetNode: node.callee,
                        }),
                        messageId: "preferTsExtrasObjectHasIn",
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
                    "require ts-extras objectHasIn over Reflect.has for stronger key-in-object narrowing.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-has-in",
            },
            fixable: "code",
            messages: {
                preferTsExtrasObjectHasIn:
                    "Prefer `objectHasIn` from `ts-extras` over `Reflect.has` for better type narrowing.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-has-in",
    });

/**
 * Default export for the `prefer-ts-extras-object-has-in` rule module.
 */
export default preferTsExtrasObjectHasInRule;
