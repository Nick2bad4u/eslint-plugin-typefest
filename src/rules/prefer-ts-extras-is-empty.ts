import type { TSESTree } from "@typescript-eslint/utils";
import type ts from "typescript";

import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
} from "../_internal/typed-rule.js";

const isZeroLiteral = (node: TSESTree.Expression): boolean =>
    node.type === "Literal" && node.value === 0;

const isLengthMemberExpression = (
    node: TSESTree.Expression
): node is TSESTree.MemberExpression & { property: TSESTree.Identifier } =>
    node.type === "MemberExpression" &&
    !node.computed &&
    node.property.type === "Identifier" &&
    node.property.name === "length";

const preferTsExtrasIsEmptyRule: ReturnType<typeof createTypedRule> =
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
                    return type.types.every((partType) =>
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
                BinaryExpression(node) {
                    if (node.operator !== "==" && node.operator !== "===") {
                        return;
                    }

                    const isLeftLengthCheck =
                        isLengthMemberExpression(node.left) &&
                        isZeroLiteral(node.right);
                    const isRightLengthCheck =
                        isLengthMemberExpression(node.right) &&
                        isZeroLiteral(node.left);

                    if (!isLeftLengthCheck && !isRightLengthCheck) {
                        return;
                    }

                    const lengthNode = isLeftLengthCheck
                        ? node.left
                        : node.right;

                    if (!isLengthMemberExpression(lengthNode)) {
                        return;
                    }

                    if (!isArrayLikeExpression(lengthNode.object)) {
                        return;
                    }

                    context.report({
                        messageId: "preferTsExtrasIsEmpty",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras isEmpty over direct array.length === 0 checks for consistent emptiness guards.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-empty.md",
            },
            messages: {
                preferTsExtrasIsEmpty:
                    "Prefer `isEmpty` from `ts-extras` over direct `array.length === 0` checks.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-empty",
    });

export default preferTsExtrasIsEmptyRule;
