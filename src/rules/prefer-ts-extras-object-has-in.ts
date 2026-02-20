/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-has-in`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * Check whether the input is reflect has call.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is reflect has call; otherwise `false`.
 */

const isReflectHasCall = (node: TSESTree.CallExpression): boolean => {
    if (node.callee.type !== "MemberExpression" || node.callee.computed) {
        return false;
    }

    return (
        node.callee.object.type === "Identifier" &&
        node.callee.object.name === "Reflect" &&
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

            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                CallExpression(node) {
                    if (!isReflectHasCall(node)) {
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
            docs: {
                description:
                    "require ts-extras objectHasIn over Reflect.has for stronger key-in-object narrowing.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-object-has-in.md",
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
