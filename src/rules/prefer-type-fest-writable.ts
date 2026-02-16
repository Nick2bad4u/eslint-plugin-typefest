import { type TSESLint, type TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const normalizeTypeText = (text: string): string => text.replaceAll(/\s+/g, "");

const normalizeTypeNodeText = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: TSESTree.TypeNode
): string => normalizeTypeText(sourceCode.getText(node));

const hasWritableMappedTypeShape = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: TSESTree.TSMappedType
): boolean => {
    if (node.readonly !== "-") {
        return false;
    }

    if (node.optional !== false) {
        return false;
    }

    if (node.nameType !== null) {
        return false;
    }

    const keyIdentifier = node.key;
    if (keyIdentifier.type !== "Identifier") {
        return false;
    }

    const constraint = node.constraint;
    if (!constraint || constraint.type !== "TSTypeOperator") {
        return false;
    }

    if (constraint.operator !== "keyof") {
        return false;
    }

    const baseType = constraint.typeAnnotation;
    if (!baseType) {
        return false;
    }

    const typeAnnotation = node.typeAnnotation;
    if (!typeAnnotation || typeAnnotation.type !== "TSIndexedAccessType") {
        return false;
    }

    const indexedObjectTypeText = normalizeTypeNodeText(
        sourceCode,
        typeAnnotation.objectType
    );
    const baseTypeText = normalizeTypeNodeText(sourceCode, baseType);

    if (indexedObjectTypeText !== baseTypeText) {
        return false;
    }

    const indexType = typeAnnotation.indexType;
    if (
        indexType.type !== "TSTypeReference" ||
        indexType.typeName.type !== "Identifier"
    ) {
        return false;
    }

    return indexType.typeName.name === keyIdentifier.name;
};

const preferTypeFestWritableRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-writable",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest Writable over manual mapped types that strip readonly with -readonly.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-writable.md",
            },
            schema: [],
            messages: {
                preferWritable:
                    "Prefer `Writable<T>` from type-fest over `{-readonly [K in keyof T]: T[K]}`.",
            },
        },
        defaultOptions: [],
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            const sourceCode = context.sourceCode;

            return {
                TSMappedType(node) {
                    if (!hasWritableMappedTypeShape(sourceCode, node)) {
                        return;
                    }

                    context.report({
                        node,
                        messageId: "preferWritable",
                    });
                },
            };
        },
    });

export default preferTypeFestWritableRule;
