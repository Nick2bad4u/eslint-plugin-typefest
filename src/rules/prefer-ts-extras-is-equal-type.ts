/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-equal-type`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule } from "../_internal/typed-rule.js";

const IS_EQUAL_TYPE_NAME = "IsEqual";
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
            const isEqualLocalNames = new Set<string>();
            const typeFestNamespaceImportNames = new Set<string>();

            for (const statement of context.sourceCode.ast.body) {
                if (statement.type !== "ImportDeclaration") {
                    continue;
                }

                const sourceValue =
                    typeof statement.source.value === "string"
                        ? statement.source.value
                        : "";

                if (sourceValue !== TYPE_FEST_PACKAGE_NAME) {
                    continue;
                }

                for (const specifier of statement.specifiers) {
                    if (
                        specifier.type === "ImportSpecifier" &&
                        specifier.imported.type === "Identifier" &&
                        specifier.imported.name === IS_EQUAL_TYPE_NAME
                    ) {
                        isEqualLocalNames.add(specifier.local.name);
                    }

                    if (specifier.type === "ImportNamespaceSpecifier") {
                        typeFestNamespaceImportNames.add(specifier.local.name);
                    }
                }
            }

            const getIsEqualTypeReference = (
                node: TSESTree.TypeNode
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

                    context.report({
                        messageId: "preferTsExtrasIsEqualType",
                        node,
                        suggest:
                            typeArguments.length === 2
                                ? [
                                      {
                                          fix(fixer) {
                                              const [leftType, rightType] =
                                                  typeArguments;

                                              if (!leftType || !rightType) {
                                                  return null;
                                              }

                                              const leftTypeText =
                                                  context.sourceCode.getText(
                                                      leftType
                                                  );
                                              const rightTypeText =
                                                  context.sourceCode.getText(
                                                      rightType
                                                  );

                                              return fixer.replaceText(
                                                  node,
                                                  `${identifierName} = isEqualType<${leftTypeText}, ${rightTypeText}>()`
                                              );
                                          },
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
            docs: {
                description:
                    "require ts-extras isEqualType over IsEqual<T, U> boolean assertion variables.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-equal-type.md",
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
