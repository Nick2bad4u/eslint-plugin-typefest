/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-equal-type`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectNamedImportLocalNamesFromSource,
    collectNamespaceImportLocalNamesFromSource,
} from "../_internal/imported-type-aliases.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueNodeTextReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const IS_EQUAL_TYPE_NAME = "IsEqual";
const IS_EQUAL_TYPE_FUNCTION_NAME = "isEqualType";
const TS_EXTRAS_PACKAGE_NAME = "ts-extras";
const TYPE_FEST_PACKAGE_NAME = "type-fest";

/**
 * ESLint rule definition for `prefer-ts-extras-is-equal-type`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsEqualTypeRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const isEqualLocalNames = collectNamedImportLocalNamesFromSource(
                context.sourceCode,
                TYPE_FEST_PACKAGE_NAME,
                IS_EQUAL_TYPE_NAME
            );
            const typeFestNamespaceImportNames =
                collectNamespaceImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_PACKAGE_NAME
                );
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_PACKAGE_NAME
            );

            /**
             * Resolve `IsEqual<...>` type references from direct or namespace
             * imports.
             */
            const getIsEqualTypeReference = (
                node: Readonly<TSESTree.TypeNode>
            ): null | TSESTree.TSTypeReference => {
                if (node.type !== "TSTypeReference") {
                    return null;
                }

                if (node.typeName.type === "Identifier") {
                    return isEqualLocalNames.has(node.typeName.name)
                        ? node
                        : null;
                }

                if (node.typeName.type !== "TSQualifiedName") {
                    return null;
                }

                if (
                    node.typeName.left.type === "Identifier" &&
                    typeFestNamespaceImportNames.has(node.typeName.left.name) &&
                    node.typeName.right.type === "Identifier" &&
                    node.typeName.right.name === IS_EQUAL_TYPE_NAME
                ) {
                    return node;
                }

                return null;
            };

            return {
                VariableDeclarator(node) {
                    if (
                        node.id.type !== "Identifier" ||
                        node.id.typeAnnotation?.typeAnnotation === undefined ||
                        node.init?.type !== "Literal" ||
                        typeof node.init.value !== "boolean"
                    ) {
                        return;
                    }

                    const isEqualTypeReference = getIsEqualTypeReference(
                        node.id.typeAnnotation.typeAnnotation
                    );

                    if (!isEqualTypeReference) {
                        return;
                    }

                    const typeArguments =
                        isEqualTypeReference.typeArguments?.params ?? [];
                    const identifierName = node.id.name;
                    const initializerValue = node.init.value;
                    const [leftType, rightType] = typeArguments;

                    if (!leftType || !rightType) {
                        context.report({
                            messageId: "preferTsExtrasIsEqualType",
                            node,
                        });

                        return;
                    }

                    const leftTypeText = context.sourceCode.getText(leftType);
                    const rightTypeText = context.sourceCode.getText(rightType);
                    const isEqualTypeSuggestionFix =
                        createSafeValueNodeTextReplacementFix({
                            context,
                            dedupeImportInsertionFixes: false,
                            importedName: IS_EQUAL_TYPE_FUNCTION_NAME,
                            imports: tsExtrasImports,
                            replacementTextFactory: (replacementName) => {
                                const callText = `${replacementName}<${leftTypeText}, ${rightTypeText}>()`;
                                const runtimePreservingExpression =
                                    initializerValue
                                        ? `${callText} || true`
                                        : `${callText} && false`;

                                return `${identifierName} = ${runtimePreservingExpression}`;
                            },
                            sourceModuleName: TS_EXTRAS_PACKAGE_NAME,
                            targetNode: node,
                        });

                    context.report({
                        messageId: "preferTsExtrasIsEqualType",
                        node,
                        suggest:
                            typeArguments.length === 2 &&
                            isEqualTypeSuggestionFix !== null
                                ? [
                                      {
                                          fix: isEqualTypeSuggestionFix,
                                          messageId:
                                              "suggestTsExtrasIsEqualType",
                                      },
                                  ]
                                : null,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras isEqualType over IsEqual<T, U> boolean assertion variables.",
                frozen: false,
                recommended: "typefest.configs.all",
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-equal-type",
            },
            hasSuggestions: true,
            messages: {
                preferTsExtrasIsEqualType:
                    "Prefer `isEqualType<T, U>()` from `ts-extras` over `IsEqual<T, U>` boolean assertion variables.",
                suggestTsExtrasIsEqualType:
                    "Replace this boolean `IsEqual<...>` assertion variable with `isEqualType<...>()`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-equal-type",
    });

/**
 * Default export for the `prefer-ts-extras-is-equal-type` rule module.
 */
export default preferTsExtrasIsEqualTypeRule;
