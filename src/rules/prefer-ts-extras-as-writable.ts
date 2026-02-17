import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const TYPE_FEST_PACKAGE_NAME = "type-fest" as const;
const WRITABLE_TYPE_NAME = "Writable" as const;

const preferTsExtrasAsWritableRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-ts-extras-as-writable",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require ts-extras asWritable over Writable<T> style assertions from type-fest.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-as-writable.md",
            },
            schema: [],
            messages: {
                preferTsExtrasAsWritable:
                    "Prefer `asWritable(value)` from `ts-extras` over `Writable<...>` assertions.",
            },
        },
        defaultOptions: [],
        create(context) {
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
                typeAnnotation: TSESTree.TypeNode
            ): void => {
                if (!isWritableTypeReference(typeAnnotation)) {
                    return;
                }

                context.report({
                    node,
                    messageId: "preferTsExtrasAsWritable",
                });
            };

            return {
                TSAsExpression(node) {
                    reportIfWritableAssertion(node, node.typeAnnotation);
                },
                TSTypeAssertion(node) {
                    reportIfWritableAssertion(node, node.typeAnnotation);
                },
            };
        },
    });

export default preferTsExtrasAsWritableRule;
