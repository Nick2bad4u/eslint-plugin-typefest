import ts from "typescript";
import { type TSESLint, type TSESTree } from "@typescript-eslint/utils";

import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
} from "../_internal/typed-rule.js";

const isWriteTarget = (node: TSESTree.MemberExpression): boolean => {
    const parent = node.parent;

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

const preferTsExtrasArrayLastRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-ts-extras-array-last",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require ts-extras arrayLast over direct array[array.length - 1] access for stronger tuple and readonly-array inference.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-array-last.md",
            },
            schema: [],
            messages: {
                preferTsExtrasArrayLast:
                    "Prefer `arrayLast` from `ts-extras` over direct `array[array.length - 1]` access for stronger inference.",
            },
        },
        defaultOptions: [],
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            const sourceCode = context.sourceCode;
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
                        node,
                        messageId: "preferTsExtrasArrayLast",
                    });
                },
            };
        },
    });

export default preferTsExtrasArrayLastRule;
