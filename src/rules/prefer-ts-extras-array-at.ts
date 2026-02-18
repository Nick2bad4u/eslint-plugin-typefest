/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-at`.
 */
import type { TSESTree } from "@typescript-eslint/utils";
import type ts from "typescript";

import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
} from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-array-at`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayAtRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            const { checker, parserServices } = getTypedRuleServices(context);

            const isArrayLikeType = (type: ts.Type): boolean => {
                const typedChecker = checker as ts.TypeChecker & {
                    isArrayType?: (candidateType: ts.Type) => boolean;
                    isTupleType?: (candidateType: ts.Type) => boolean;
                };

                if (
                    typedChecker.isArrayType?.(type) ||
                    typedChecker.isTupleType?.(type)
                ) {
                    return true;
                }

                if (type.isUnion()) {
                    return type.types.some((partType) =>
                        isArrayLikeType(partType)
                    );
                }

                const typeText = checker.typeToString(type);
                return (
                    typeText.endsWith("[]") || typeText.endsWith("readonly []")
                );
            };

            const isArrayLikeExpression = (
                expression: TSESTree.Expression
            ): boolean => {
                try {
                    const tsNode =
                        parserServices.esTreeNodeToTSNodeMap.get(expression);
                    const expressionType = checker.getTypeAtLocation(tsNode);
                    return isArrayLikeType(expressionType);
                } catch {
                    return false;
                }
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
                        node.callee.property.name !== "at"
                    ) {
                        return;
                    }

                    if (!isArrayLikeExpression(node.callee.object)) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasArrayAt",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras arrayAt over Array#at for stronger element inference.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-array-at.md",
            },
            messages: {
                preferTsExtrasArrayAt:
                    "Prefer `arrayAt` from `ts-extras` over `array.at(...)` for stronger element inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-at",
    });

/**
 * Default export for the `prefer-ts-extras-array-at` rule module.
 */
export default preferTsExtrasArrayAtRule;

