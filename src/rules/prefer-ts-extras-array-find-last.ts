import ts from "typescript";

import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
} from "../_internal/typed-rule.js";

const preferTsExtrasArrayFindLastRule = createTypedRule({
    name: "prefer-ts-extras-array-find-last",
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require ts-extras arrayFindLast over Array#findLast for stronger predicate inference.",
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-array-find-last.md",
        },
        schema: [],
        messages: {
            preferTsExtrasArrayFindLast:
                "Prefer `arrayFindLast` from `ts-extras` over `array.findLast(...)` for stronger predicate inference.",
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
                    node.callee.property.name !== "findLast"
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
                    messageId: "preferTsExtrasArrayFindLast",
                });
            },
        };
    },
});

export default preferTsExtrasArrayFindLastRule;
