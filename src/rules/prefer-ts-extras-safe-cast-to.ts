import ts from "typescript";
import type { TSESTree } from "@typescript-eslint/utils";

import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
    isTypeAssignableTo,
} from "../_internal/typed-rule.js";

const isIgnoredTypeAnnotation = (typeAnnotation: TSESTree.TypeNode): boolean =>
    typeAnnotation.type === "TSAnyKeyword" ||
    typeAnnotation.type === "TSNeverKeyword" ||
    typeAnnotation.type === "TSUnknownKeyword" ||
    (typeAnnotation.type === "TSTypeReference" &&
        typeAnnotation.typeName.type === "Identifier" &&
        typeAnnotation.typeName.name === "const");

const preferTsExtrasSafeCastToRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-ts-extras-safe-cast-to",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require ts-extras safeCastTo for assignable type assertions instead of direct `as` casts.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-safe-cast-to.md",
            },
            schema: [],
            messages: {
                preferTsExtrasSafeCastTo:
                    "Prefer `safeCastTo<T>(value)` from `ts-extras` over direct `as` assertions when the cast is already type-safe.",
            },
        },
        defaultOptions: [],
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            const { checker, parserServices } = getTypedRuleServices(context);

            const reportIfSafeCastCandidate = ({
                expression,
                node,
                typeAnnotation,
            }: {
                expression: TSESTree.Expression;
                node: TSESTree.Node;
                typeAnnotation: TSESTree.TypeNode;
            }): void => {
                if (isIgnoredTypeAnnotation(typeAnnotation)) {
                    return;
                }

                try {
                    const expressionTsNode =
                        parserServices.esTreeNodeToTSNodeMap.get(expression);
                    const annotationTsNode =
                        parserServices.esTreeNodeToTSNodeMap.get(
                            typeAnnotation
                        );

                    if (!ts.isTypeNode(annotationTsNode)) {
                        return;
                    }

                    const sourceType =
                        checker.getTypeAtLocation(expressionTsNode);
                    const targetType =
                        checker.getTypeFromTypeNode(annotationTsNode);

                    if (!isTypeAssignableTo(checker, sourceType, targetType)) {
                        return;
                    }

                    context.report({
                        node,
                        messageId: "preferTsExtrasSafeCastTo",
                    });
                } catch {
                    // Best effort only: skip when parser services/type info is unavailable for this node.
                }
            };

            return {
                TSAsExpression(node) {
                    reportIfSafeCastCandidate({
                        expression: node.expression,
                        node,
                        typeAnnotation: node.typeAnnotation,
                    });
                },
                TSTypeAssertion(node) {
                    reportIfSafeCastCandidate({
                        expression: node.expression,
                        node,
                        typeAnnotation: node.typeAnnotation,
                    });
                },
            };
        },
    });

export default preferTsExtrasSafeCastToRule;
