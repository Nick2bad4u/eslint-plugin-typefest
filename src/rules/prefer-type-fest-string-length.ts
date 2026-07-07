import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { arrayFirst } from "ts-extras";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-string-length`.
 */
import {
    collectDirectNamedImportsFromSource,
    collectNamedImportLocalNamesFromSource,
    collectNamespaceImportLocalNamesFromSource,
    createSafeTypeNodeTextReplacementFix,
    isTypeParameterNameShadowed,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { setContainsValue } from "../_internal/set-membership.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const STRING_LENGTH_TYPE_NAME = "StringLength" as const;
const STRING_TO_ARRAY_TYPE_NAME = "StringToArray" as const;

const isLengthLiteralIndexType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    node.type === AST_NODE_TYPES.TSLiteralType &&
    node.literal.type === AST_NODE_TYPES.Literal &&
    node.literal.value === "length";

const isDirectStringToArrayReference = (
    node: Readonly<TSESTree.TSTypeReference>,
    stringToArrayLocalNames: ReadonlySet<string>
): boolean =>
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    setContainsValue(stringToArrayLocalNames, node.typeName.name) &&
    !isTypeParameterNameShadowed(node, node.typeName.name);

const isNamespaceStringToArrayReference = (
    node: Readonly<TSESTree.TSTypeReference>,
    typeFestNamespaceImportNames: ReadonlySet<string>
): boolean =>
    node.typeName.type === AST_NODE_TYPES.TSQualifiedName &&
    node.typeName.left.type === AST_NODE_TYPES.Identifier &&
    setContainsValue(typeFestNamespaceImportNames, node.typeName.left.name) &&
    node.typeName.right.name === STRING_TO_ARRAY_TYPE_NAME &&
    !isTypeParameterNameShadowed(node, node.typeName.left.name);

const getStringToArrayInputType = (
    node: Readonly<TSESTree.TSTypeReference>,
    stringToArrayLocalNames: ReadonlySet<string>,
    typeFestNamespaceImportNames: ReadonlySet<string>
): TSESTree.TypeNode | undefined => {
    if (
        !isDirectStringToArrayReference(node, stringToArrayLocalNames) &&
        !isNamespaceStringToArrayReference(node, typeFestNamespaceImportNames)
    ) {
        return undefined;
    }

    const typeArguments = node.typeArguments?.params;

    return typeArguments?.length === 1 ? arrayFirst(typeArguments) : undefined;
};

/** ESLint rule definition for `prefer-type-fest-string-length`. */
const preferTypeFestStringLengthRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const stringToArrayLocalNames =
                collectNamedImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE,
                    STRING_TO_ARRAY_TYPE_NAME
                );
            const typeFestNamespaceImportNames =
                collectNamespaceImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE
                );

            return {
                TSIndexedAccessType(
                    node: Readonly<TSESTree.TSIndexedAccessType>
                ) {
                    if (
                        !isLengthLiteralIndexType(node.indexType) ||
                        node.objectType.type !== AST_NODE_TYPES.TSTypeReference
                    ) {
                        return;
                    }

                    const inputType = getStringToArrayInputType(
                        node.objectType,
                        stringToArrayLocalNames,
                        typeFestNamespaceImportNames
                    );

                    if (!inputType) {
                        return;
                    }

                    const inputTypeText = context.sourceCode.getText(inputType);
                    const fix = createSafeTypeNodeTextReplacementFix(
                        node,
                        STRING_LENGTH_TYPE_NAME,
                        `${STRING_LENGTH_TYPE_NAME}<${inputTypeText}>`,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix,
                        messageId: "preferStringLength",
                        node,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest StringLength over StringToArray<T>['length'] string-length extraction.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-string-length",
            },
            fixable: "code",
            messages: {
                preferStringLength:
                    "Prefer `StringLength<T>` from type-fest over `StringToArray<T>['length']`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-string-length",
    });

export default preferTypeFestStringLengthRule;
