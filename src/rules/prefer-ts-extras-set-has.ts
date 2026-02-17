import type ts from "typescript";

import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
} from "../_internal/typed-rule.js";

const preferTsExtrasSetHasRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-ts-extras-set-has",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require ts-extras setHas over Set#has for stronger element narrowing.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-set-has.md",
            },
            schema: [],
            messages: {
                preferTsExtrasSetHas:
                    "Prefer `setHas` from `ts-extras` over `set.has(...)` for stronger element narrowing.",
            },
        },
        defaultOptions: [],
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
                        node,
                        messageId: "preferTsExtrasSetHas",
                    });
                },
            };
        },
    });

export default preferTsExtrasSetHasRule;
