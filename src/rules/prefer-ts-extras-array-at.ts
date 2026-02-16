import ts from "typescript";
import { TSESTree } from "@typescript-eslint/utils";

import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
} from "../_internal/typed-rule.js";

const preferTsExtrasArrayAtRule = createTypedRule({
    name: "prefer-ts-extras-array-at",
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require ts-extras arrayAt over Array#at for stronger element inference.",
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-array-at.md",
        },
        schema: [],
        messages: {
            preferTsExtrasArrayAt:
                "Prefer `arrayAt` from `ts-extras` over `array.at(...)` for stronger element inference.",
        },
    },
    defaultOptions: [],
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

            if (typedChecker.isArrayType?.(type) || typedChecker.isTupleType?.(type)) {
                return true;
            }

            if (type.isUnion()) {
                return type.types.some((partType) => isArrayLikeType(partType));
            }

            const typeText = checker.typeToString(type);
            return typeText.endsWith("[]") || typeText.endsWith("readonly []");
        };

        const isArrayLikeExpression = (expression: TSESTree.Expression): boolean => {
            try {
                const tsNode = parserServices.esTreeNodeToTSNodeMap.get(expression);
                const expressionType = checker.getTypeAtLocation(tsNode);
                return isArrayLikeType(expressionType);
            } catch {
                return false;
            }
        };

        return {
            CallExpression(node) {
                if (node.callee.type !== "MemberExpression" || node.callee.computed) {
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
                    node,
                    messageId: "preferTsExtrasArrayAt",
                });
            },
        };
    },
});

export default preferTsExtrasArrayAtRule;
