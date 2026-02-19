/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-join`.
 */
import type ts from "typescript";

import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
} from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-array-join`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayJoinRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename;
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
                        node.callee.property.name !== "join"
                    ) {
                        return;
                    }

                    try {
                        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(
                            node.callee.object
                        );
                        const objectType = checker.getTypeAtLocation(tsNode);

                        if (!isArrayLikeType(objectType)) {
                            return;
                        }
                    }
                    /* c8 ignore start -- defensive parser-services failure path */
                    catch {
                        return;
                    }
                    /* c8 ignore stop */

                    context.report({
                        messageId: "preferTsExtrasArrayJoin",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras arrayJoin over Array#join for stronger tuple-aware typing.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-array-join.md",
            },
            messages: {
                preferTsExtrasArrayJoin:
                    "Prefer `arrayJoin` from `ts-extras` over `array.join(...)` for stronger tuple-aware typing.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-join",
    });

/**
 * Default export for the `prefer-ts-extras-array-join` rule module.
 */
export default preferTsExtrasArrayJoinRule;
