/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-as-writable`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    getSafeLocalNameForImportedValue,
} from "../_internal/imported-value-symbols.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const TYPE_FEST_PACKAGE_NAME = "type-fest" as const;
const WRITABLE_TYPE_NAME = "Writable" as const;

/**
 * ESLint rule definition for `prefer-ts-extras-as-writable`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasAsWritableRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            const writableLocalNames = new Set<string>();
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
                        specifier.imported.name === WRITABLE_TYPE_NAME
                    ) {
                        writableLocalNames.add(specifier.local.name);
                    }

                    if (specifier.type === "ImportNamespaceSpecifier") {
                        typeFestNamespaceImportNames.add(specifier.local.name);
                    }
                }
            }

            const isWritableTypeReference = (
                typeAnnotation: TSESTree.TypeNode
            ): boolean => {
                if (typeAnnotation.type !== "TSTypeReference") {
                    return false;
                }

                if (typeAnnotation.typeName.type === "Identifier") {
                    return writableLocalNames.has(typeAnnotation.typeName.name);
                }

                if (typeAnnotation.typeName.type !== "TSQualifiedName") {
                    return false;
                }

                return (
                    typeAnnotation.typeName.left.type === "Identifier" &&
                    typeFestNamespaceImportNames.has(
                        typeAnnotation.typeName.left.name
                    ) &&
                    typeAnnotation.typeName.right.type === "Identifier" &&
                    typeAnnotation.typeName.right.name === WRITABLE_TYPE_NAME
                );
            };

            const reportIfWritableAssertion = (
                node: TSESTree.Node,
                expression: TSESTree.Expression,
                typeAnnotation: TSESTree.TypeNode
            ): void => {
                if (!isWritableTypeReference(typeAnnotation)) {
                    return;
                }

                const replacementName = getSafeLocalNameForImportedValue({
                    context,
                    importedName: "asWritable",
                    imports: tsExtrasImports,
                    referenceNode: node,
                    sourceModuleName: "ts-extras",
                });

                const fix = replacementName
                    ? (fixer: TSESLint.RuleFixer) =>
                          fixer.replaceText(
                              node,
                              `${replacementName}(${context.sourceCode.getText(expression)})`
                          )
                    : null;

                context.report({
                    fix,
                    messageId: "preferTsExtrasAsWritable",
                    node,
                });
            };

            return {
                TSAsExpression(node) {
                    reportIfWritableAssertion(
                        node,
                        node.expression,
                        node.typeAnnotation
                    );
                },
                TSTypeAssertion(node) {
                    reportIfWritableAssertion(
                        node,
                        node.expression,
                        node.typeAnnotation
                    );
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras asWritable over Writable<T> style assertions from type-fest.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-as-writable.md",
            },
            fixable: "code",
            messages: {
                preferTsExtrasAsWritable:
                    "Prefer `asWritable(value)` from `ts-extras` over `Writable<...>` assertions.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-as-writable",
    });

/**
 * Default export for the `prefer-ts-extras-as-writable` rule module.
 */
export default preferTsExtrasAsWritableRule;
