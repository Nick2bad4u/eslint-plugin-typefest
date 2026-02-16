import ts from "typescript";

import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
} from "../_internal/typed-rule.js";

const preferTsExtrasArrayConcatRule = createTypedRule({
    name: "prefer-ts-extras-array-concat",
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require ts-extras arrayConcat over Array#concat for stronger tuple and readonly-array typing.",
            recommended: true,
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-array-concat.md",
        },
        schema: [],
        messages: {
            preferTsExtrasArrayConcat:
                "Prefer `arrayConcat` from `ts-extras` over `array.concat(...)` for stronger tuple and readonly-array typing.",
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

        return {
            CallExpression(node) {
                if (node.callee.type !== "MemberExpression" || node.callee.computed) {
                    return;
                }

                if (
                    node.callee.property.type !== "Identifier" ||
                    node.callee.property.name !== "concat"
                ) {
                    return;
                }

                try {
                    const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.callee.object);
                    const objectType = checker.getTypeAtLocation(tsNode);

                    if (!isArrayLikeType(objectType)) {
                        return;
                    }
                } catch {
                    return;
                }

                context.report({
                    node,
                    messageId: "preferTsExtrasArrayConcat",
                });
            },
        };
    },
});

export default preferTsExtrasArrayConcatRule;
