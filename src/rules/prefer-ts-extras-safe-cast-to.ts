/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-safe-cast-to`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import ts from "typescript";

import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
    isTypeAssignableTo,
} from "../_internal/typed-rule.js";

/**
 * Check whether the input is ignored type annotation.
 *
 * @param typeAnnotation - Value to inspect.
 *
 * @returns `true` when the value is ignored type annotation; otherwise `false`.
 */

const isIgnoredTypeAnnotation = (typeAnnotation: TSESTree.TypeNode): boolean =>
    typeAnnotation.type === "TSAnyKeyword" ||
    typeAnnotation.type === "TSNeverKeyword" ||
    typeAnnotation.type === "TSUnknownKeyword" ||
    (typeAnnotation.type === "TSTypeReference" &&
        typeAnnotation.typeName.type === "Identifier" &&
        typeAnnotation.typeName.name === "const");

/**
 * ESLint rule definition for `prefer-ts-extras-safe-cast-to`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasSafeCastToRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
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
                        messageId: "preferTsExtrasSafeCastTo",
                        node,
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
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras safeCastTo for assignable type assertions instead of direct `as` casts.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-safe-cast-to.md",
            },
            messages: {
                preferTsExtrasSafeCastTo:
                    "Prefer `safeCastTo<T>(value)` from `ts-extras` over direct `as` assertions when the cast is already type-safe.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-safe-cast-to",
    });

/**
 * Default export for the `prefer-ts-extras-safe-cast-to` rule module.
 */
export default preferTsExtrasSafeCastToRule;
