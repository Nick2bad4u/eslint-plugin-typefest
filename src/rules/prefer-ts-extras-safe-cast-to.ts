/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-safe-cast-to`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import ts from "typescript";

import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueNodeTextReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { safeTypeOperation } from "../_internal/safe-type-operation.js";
import {
    createTypedRule,
    getTypedRuleServices,
    isTypeAssignableTo,
} from "../_internal/typed-rule.js";

/**
 * Checks whether a type assertion target should be excluded from `safeCastTo`
 * suggestions.
 *
 * @param typeAnnotation - Asserted type annotation to inspect.
 *
 * @returns `true` for broad or intentionally unsafe targets (`any`, `unknown`,
 *   `never`, and `const` assertions) where replacement is not desirable.
 */

const isIgnoredTypeAnnotation = (
    typeAnnotation: Readonly<TSESTree.TypeNode>
): boolean =>
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
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            const { checker, parserServices } = getTypedRuleServices(context);

            /**
             * Report assertions that can be replaced by `safeCastTo<T>(value)`
             * without changing assignability behavior.
             */
            const reportIfSafeCastCandidate = ({
                expression,
                node,
                typeAnnotation,
            }: Readonly<{
                expression: TSESTree.Expression;
                node: TSESTree.Node;
                typeAnnotation: TSESTree.TypeNode;
            }>): void => {
                if (isIgnoredTypeAnnotation(typeAnnotation)) {
                    return;
                }

                const result = safeTypeOperation({
                    operation: () => {
                        const expressionTsNode =
                            parserServices.esTreeNodeToTSNodeMap.get(
                                expression
                            );
                        const annotationTsNode =
                            parserServices.esTreeNodeToTSNodeMap.get(
                                typeAnnotation
                            );

                        if (!ts.isTypeNode(annotationTsNode)) {
                            return null;
                        }

                        const sourceType =
                            checker.getTypeAtLocation(expressionTsNode);
                        const targetType =
                            checker.getTypeFromTypeNode(annotationTsNode);

                        if (
                            !isTypeAssignableTo(checker, sourceType, targetType)
                        ) {
                            return null;
                        }

                        return createSafeValueNodeTextReplacementFix({
                            context,
                            importedName: "safeCastTo",
                            imports: tsExtrasImports,
                            replacementTextFactory: (replacementName) =>
                                `${replacementName}<${context.sourceCode.getText(typeAnnotation)}>(${context.sourceCode.getText(expression)})`,
                            sourceModuleName: "ts-extras",
                            targetNode: node,
                        });
                    },
                    reason: "safe-cast-to-candidate-analysis-failed",
                });

                if (!result.ok || result.value === null) {
                    return;
                }

                context.report({
                    fix: result.value,
                    messageId: "preferTsExtrasSafeCastTo",
                    node,
                });
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
            deprecated: false,
            docs: {
                description:
                    "require ts-extras safeCastTo for assignable type assertions instead of direct `as` casts.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-safe-cast-to",
            },
            fixable: "code",
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
