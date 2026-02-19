/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-set-has`.
 */
import type ts from "typescript";

import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
} from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-set-has`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasSetHasRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            const { checker, parserServices } = getTypedRuleServices(context);

            const isSetType = (type: ts.Type): boolean => {
                if (type.isUnion()) {
                    return type.types.some((partType) => isSetType(partType));
                }

                const typeText = checker.typeToString(type);
                return (
                    typeText.startsWith("ReadonlySet<") ||
                    typeText.startsWith("Set<")
                );
            };

            return {
                CallExpression(node) {
                    if (
                        node.callee.type !== "MemberExpression" ||
                        node.callee.computed
                    ) {
                        return;
                    }

                    if (
                        node.callee.property.type !== "Identifier" ||
                        node.callee.property.name !== "has"
                    ) {
                        return;
                    }

                    try {
                        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(
                            node.callee.object
                        );
                        const objectType = checker.getTypeAtLocation(tsNode);

                        if (!isSetType(objectType)) {
                            return;
                        }
                    } catch {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasSetHas",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras setHas over Set#has for stronger element narrowing.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-set-has.md",
            },
            messages: {
                preferTsExtrasSetHas:
                    "Prefer `setHas` from `ts-extras` over `set.has(...)` for stronger element narrowing.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-set-has",
    });

/**
 * Default export for the `prefer-ts-extras-set-has` rule module.
 */
export default preferTsExtrasSetHasRule;
