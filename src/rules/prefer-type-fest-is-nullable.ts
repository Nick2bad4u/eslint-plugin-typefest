import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-is-nullable`.
 */
import { arrayFirst } from "ts-extras";

import {
    collectDirectNamedImportsFromSource,
    collectNamedImportLocalNamesFromSource,
    collectNamespaceImportLocalNamesFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { areEquivalentTypeNodes } from "../_internal/normalize-expression-text.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { setContainsValue } from "../_internal/set-membership.js";
import {
    hasFalseTrueBranches,
    isBooleanLiteralType,
} from "../_internal/type-guard-conditional-patterns.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const EXTRACT_TYPE_NAME = "Extract" as const;
const IS_ANY_TYPE_NAME = "IsAny" as const;
const TYPE_NAME = "IsNullable" as const;

const getSingleTypeArgument = (
    node: Readonly<TSESTree.TSTypeReference>
): TSESTree.TypeNode | undefined => {
    const typeArguments = node.typeArguments?.params;

    return typeArguments?.length === 1 ? arrayFirst(typeArguments) : undefined;
};

const isNumericLiteralType = (
    node: Readonly<TSESTree.TypeNode>,
    value: number
): boolean =>
    node.type === AST_NODE_TYPES.TSLiteralType &&
    node.literal.type === AST_NODE_TYPES.Literal &&
    node.literal.value === value;

const isDirectTypeFestIsAnyReference = (
    node: Readonly<TSESTree.TSTypeReference>,
    isAnyLocalNames: ReadonlySet<string>
): boolean =>
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    setContainsValue(isAnyLocalNames, node.typeName.name);

const isNamespaceTypeFestIsAnyReference = (
    node: Readonly<TSESTree.TSTypeReference>,
    typeFestNamespaceImportNames: ReadonlySet<string>
): boolean =>
    node.typeName.type === AST_NODE_TYPES.TSQualifiedName &&
    node.typeName.left.type === AST_NODE_TYPES.Identifier &&
    setContainsValue(typeFestNamespaceImportNames, node.typeName.left.name) &&
    node.typeName.right.name === IS_ANY_TYPE_NAME;

const getImportedIsAnyCheckInput = (
    node: Readonly<TSESTree.TSConditionalType>,
    isAnyLocalNames: ReadonlySet<string>,
    typeFestNamespaceImportNames: ReadonlySet<string>
): TSESTree.TypeNode | undefined => {
    if (
        !isBooleanLiteralType(node.extendsType, true) ||
        node.checkType.type !== AST_NODE_TYPES.TSTypeReference ||
        (!isDirectTypeFestIsAnyReference(node.checkType, isAnyLocalNames) &&
            !isNamespaceTypeFestIsAnyReference(
                node.checkType,
                typeFestNamespaceImportNames
            ))
    ) {
        return undefined;
    }

    return getSingleTypeArgument(node.checkType);
};

const getManualIsAnyCheckInput = (
    node: Readonly<TSESTree.TSConditionalType>
): TSESTree.TypeNode | undefined => {
    if (
        !isNumericLiteralType(node.checkType, 0) ||
        node.extendsType.type !== AST_NODE_TYPES.TSIntersectionType ||
        node.extendsType.types.length !== 2
    ) {
        return undefined;
    }

    const [leftType, rightType] = node.extendsType.types;

    if (!leftType || !rightType || !isNumericLiteralType(leftType, 1)) {
        return undefined;
    }

    return rightType;
};

const getExtractNullCheckInput = (
    node: Readonly<TSESTree.TSConditionalType>
): TSESTree.TypeNode | undefined => {
    if (
        !hasFalseTrueBranches(node) ||
        node.extendsType.type !== AST_NODE_TYPES.TSNeverKeyword ||
        node.checkType.type !== AST_NODE_TYPES.TSTypeReference ||
        node.checkType.typeName.type !== AST_NODE_TYPES.Identifier ||
        node.checkType.typeName.name !== EXTRACT_TYPE_NAME
    ) {
        return undefined;
    }

    const typeArguments = node.checkType.typeArguments?.params;
    const [inputType, extractedType] = typeArguments ?? [];

    if (
        typeArguments?.length !== 2 ||
        !inputType ||
        extractedType?.type !== AST_NODE_TYPES.TSNullKeyword
    ) {
        return undefined;
    }

    return inputType;
};

const getIsNullableTypeGuardInput = (
    node: Readonly<TSESTree.TSConditionalType>,
    isAnyLocalNames: ReadonlySet<string>,
    typeFestNamespaceImportNames: ReadonlySet<string>
): TSESTree.TypeNode | undefined => {
    if (
        !isBooleanLiteralType(node.trueType, true) ||
        node.falseType.type !== AST_NODE_TYPES.TSConditionalType
    ) {
        return undefined;
    }

    const outerInput =
        getImportedIsAnyCheckInput(
            node,
            isAnyLocalNames,
            typeFestNamespaceImportNames
        ) ?? getManualIsAnyCheckInput(node);
    const innerInput = getExtractNullCheckInput(node.falseType);

    if (
        !outerInput ||
        !innerInput ||
        !areEquivalentTypeNodes(outerInput, innerInput)
    ) {
        return undefined;
    }

    return outerInput;
};

/** ESLint rule definition for `prefer-type-fest-is-nullable`. */
const preferTypeFestIsNullableRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const isAnyLocalNames = collectNamedImportLocalNamesFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE,
                IS_ANY_TYPE_NAME
            );
            const typeFestNamespaceImportNames =
                collectNamespaceImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE
                );

            return {
                TSConditionalType(node: Readonly<TSESTree.TSConditionalType>) {
                    const checkedType = getIsNullableTypeGuardInput(
                        node,
                        isAnyLocalNames,
                        typeFestNamespaceImportNames
                    );

                    if (!checkedType) {
                        return;
                    }

                    const checkedTypeText =
                        context.sourceCode.getText(checkedType);
                    const fix = createSafeTypeNodeTextReplacementFix(
                        node,
                        TYPE_NAME,
                        `${TYPE_NAME}<${checkedTypeText}>`,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix,
                        messageId: "preferIsNullable",
                        node,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest IsNullable over equivalent any-safe nullable conditional type guards.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-is-nullable",
            },
            fixable: "code",
            messages: {
                preferIsNullable:
                    "Prefer `IsNullable<T>` from type-fest over equivalent any-safe nullable conditional type guards.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-is-nullable",
    });

export default preferTypeFestIsNullableRule;
