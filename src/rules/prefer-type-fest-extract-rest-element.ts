import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { arrayFirst } from "ts-extras";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-extract-rest-element`.
 */
import {
    collectDirectNamedImportsFromSource,
    collectNamedImportLocalNamesFromSource,
    collectNamespaceImportLocalNamesFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { setContainsValue } from "../_internal/set-membership.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const EXTRACT_REST_ELEMENT_TYPE_NAME = "ExtractRestElement" as const;
const SPLIT_ON_REST_ELEMENT_TYPE_NAME = "SplitOnRestElement" as const;

const isNumberIndexType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    node.type === AST_NODE_TYPES.TSNumberKeyword;

const isNumericLiteralIndexType = (
    node: Readonly<TSESTree.TypeNode>,
    value: number
): boolean =>
    node.type === AST_NODE_TYPES.TSLiteralType &&
    node.literal.type === AST_NODE_TYPES.Literal &&
    node.literal.value === value;

const getSingleTypeArgument = (
    node: Readonly<TSESTree.TSTypeReference>
): TSESTree.TypeNode | undefined => {
    const typeArguments = node.typeArguments?.params;

    return typeArguments?.length === 1 ? arrayFirst(typeArguments) : undefined;
};

const isDirectSplitOnRestElementReference = (
    node: Readonly<TSESTree.TSTypeReference>,
    splitOnRestElementLocalNames: ReadonlySet<string>
): boolean =>
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    setContainsValue(splitOnRestElementLocalNames, node.typeName.name);

const isNamespaceSplitOnRestElementReference = (
    node: Readonly<TSESTree.TSTypeReference>,
    typeFestNamespaceImportNames: ReadonlySet<string>
): boolean =>
    node.typeName.type === AST_NODE_TYPES.TSQualifiedName &&
    node.typeName.left.type === AST_NODE_TYPES.Identifier &&
    setContainsValue(typeFestNamespaceImportNames, node.typeName.left.name) &&
    node.typeName.right.name === SPLIT_ON_REST_ELEMENT_TYPE_NAME;

const getSplitOnRestElementArgument = (
    node: Readonly<TSESTree.TSIndexedAccessType>,
    splitOnRestElementLocalNames: ReadonlySet<string>,
    typeFestNamespaceImportNames: ReadonlySet<string>
): TSESTree.TypeNode | undefined => {
    if (
        !isNumericLiteralIndexType(node.indexType, 1) ||
        node.objectType.type !== AST_NODE_TYPES.TSTypeReference ||
        (!isDirectSplitOnRestElementReference(
            node.objectType,
            splitOnRestElementLocalNames
        ) &&
            !isNamespaceSplitOnRestElementReference(
                node.objectType,
                typeFestNamespaceImportNames
            ))
    ) {
        return undefined;
    }

    return getSingleTypeArgument(node.objectType);
};

const getExtractRestElementArgument = (
    node: Readonly<TSESTree.TSIndexedAccessType>,
    splitOnRestElementLocalNames: ReadonlySet<string>,
    typeFestNamespaceImportNames: ReadonlySet<string>
): TSESTree.TypeNode | undefined =>
    isNumberIndexType(node.indexType) &&
    node.objectType.type === AST_NODE_TYPES.TSIndexedAccessType
        ? getSplitOnRestElementArgument(
              node.objectType,
              splitOnRestElementLocalNames,
              typeFestNamespaceImportNames
          )
        : undefined;

/** ESLint rule definition for `prefer-type-fest-extract-rest-element`. */
const preferTypeFestExtractRestElementRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const splitOnRestElementLocalNames =
                collectNamedImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE,
                    SPLIT_ON_REST_ELEMENT_TYPE_NAME
                );
            const typeFestNamespaceImportNames =
                collectNamespaceImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE
                );

            return {
                TSIndexedAccessType(node) {
                    const tupleType = getExtractRestElementArgument(
                        node,
                        splitOnRestElementLocalNames,
                        typeFestNamespaceImportNames
                    );

                    if (!tupleType) {
                        return;
                    }

                    const tupleTypeText = context.sourceCode.getText(tupleType);
                    const fix = createSafeTypeNodeTextReplacementFix(
                        node,
                        EXTRACT_REST_ELEMENT_TYPE_NAME,
                        `${EXTRACT_REST_ELEMENT_TYPE_NAME}<${tupleTypeText}>`,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix,
                        messageId: "preferExtractRestElement",
                        node,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest ExtractRestElement over SplitOnRestElement<T>[1][number] rest-element extraction.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-extract-rest-element",
            },
            fixable: "code",
            messages: {
                preferExtractRestElement:
                    "Prefer `ExtractRestElement<T>` from type-fest over `SplitOnRestElement<T>[1][number]`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-extract-rest-element",
    });

export default preferTypeFestExtractRestElementRule;
