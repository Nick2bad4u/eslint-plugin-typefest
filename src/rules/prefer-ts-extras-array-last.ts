/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-last`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
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
 * Check whether the input is last index pattern.
 *
 * @param sourceCode - Value to inspect.
 * @param objectExpression - Value to inspect.
 * @param propertyExpression - Value to inspect.
 *
 * @returns `true` when the value is last index pattern; otherwise `false`.
 */

const isLastIndexPattern = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    objectExpression: TSESTree.Expression,
    propertyExpression: TSESTree.Expression | TSESTree.PrivateIdentifier
): boolean => {
    if (propertyExpression.type === "PrivateIdentifier") {
        return false;
    }

    if (
        propertyExpression.type !== "BinaryExpression" ||
        propertyExpression.operator !== "-"
    ) {
        return false;
    }

    if (
        propertyExpression.right.type !== "Literal" ||
        propertyExpression.right.value !== 1
    ) {
        return false;
    }

    if (
        propertyExpression.left.type !== "MemberExpression" ||
        propertyExpression.left.computed ||
        propertyExpression.left.property.type !== "Identifier" ||
        propertyExpression.left.property.name !== "length"
    ) {
        return false;
    }

    return (
        sourceCode.getText(propertyExpression.left.object) ===
        sourceCode.getText(objectExpression)
    );
};

/**
 * ESLint rule definition for `prefer-ts-extras-array-last`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayLastRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            const { sourceCode } = context;
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
                    if (!node.computed) {
                        return;
                    }

                    if (isWriteTarget(node)) {
                        return;
                    }

                    if (!isArrayLikeExpression(node.object)) {
                        return;
                    }

                    if (
                        !isLastIndexPattern(
                            sourceCode,
                            node.object,
                            node.property
                        )
                    ) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasArrayLast",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras arrayLast over direct array[array.length - 1] access for stronger tuple and readonly-array inference.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-array-last.md",
            },
            messages: {
                preferTsExtrasArrayLast:
                    "Prefer `arrayLast` from `ts-extras` over direct `array[array.length - 1]` access for stronger inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-last",
    });

/**
 * Default export for the `prefer-ts-extras-array-last` rule module.
 */
export default preferTsExtrasArrayLastRule;
