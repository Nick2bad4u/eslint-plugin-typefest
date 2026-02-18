/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-first`.
 */
import type { TSESTree } from "@typescript-eslint/utils";
import type ts from "typescript";

import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
} from "../_internal/typed-rule.js";

/**
 * Check whether the input is write target.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is write target; otherwise `false`.
 */

const isWriteTarget = (node: TSESTree.MemberExpression): boolean => {
    const { parent } = node;

    if (parent.type === "AssignmentExpression" && parent.left === node) {
        return true;
    }

    if (parent.type === "UpdateExpression" && parent.argument === node) {
        return true;
    }

    return (
        parent.type === "UnaryExpression" &&
        parent.operator === "delete" &&
        parent.argument === node
    );
};

/**
 * Check whether the input is zero property.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is zero property; otherwise `false`.
 */

const isZeroProperty = (
    node: TSESTree.Expression | TSESTree.PrivateIdentifier
): boolean =>
    node.type === "Literal" && (node.value === 0 || node.value === "0");

/**
 * ESLint rule definition for `prefer-ts-extras-array-first`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayFirstRule: ReturnType<typeof createTypedRule> =
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
                    typeText.endsWith("[]") ||
                    typeText.startsWith("readonly [") ||
                    typeText.startsWith("[")
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
                MemberExpression(node) {
                    if (!node.computed || !isZeroProperty(node.property)) {
                        return;
                    }

                    if (isWriteTarget(node)) {
                        return;
                    }

                    if (!isArrayLikeExpression(node.object)) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasArrayFirst",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras arrayFirst over direct [0] array access for stronger tuple and readonly-array inference.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-array-first.md",
            },
            messages: {
                preferTsExtrasArrayFirst:
                    "Prefer `arrayFirst` from `ts-extras` over direct `array[0]` access for stronger inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-first",
    });

/**
 * Default export for the `prefer-ts-extras-array-first` rule module.
 */
export default preferTsExtrasArrayFirstRule;

