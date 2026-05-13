import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-pick-index-signature`.
 */
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { isDefined } from "ts-extras";

import { areEquivalentTypeNodes } from "../_internal/normalize-expression-text.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    isIdentifierTypeReference,
    unwrapParenthesizedTypeNode,
} from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const isEmptyObjectTypeLiteral = (node: Readonly<TSESTree.TypeNode>): boolean =>
    node.type === AST_NODE_TYPES.TSTypeLiteral && node.members.length === 0;

const hasDefaultMappedTypeModifiers = (
    node: Readonly<TSESTree.TSMappedType>
): boolean =>
    (node.readonly === false || !isDefined(node.readonly)) &&
    (node.optional === false || !isDefined(node.optional));

const hasPickIndexSignatureMappedTypeShape = (
    node: Readonly<TSESTree.TSMappedType>
): boolean => {
    if (!hasDefaultMappedTypeModifiers(node)) {
        return false;
    }

    const constraint = node.constraint;

    if (
        constraint.type !== AST_NODE_TYPES.TSTypeOperator ||
        constraint.operator !== "keyof"
    ) {
        return false;
    }

    const constraintTypeAnnotation = constraint.typeAnnotation;
    if (constraintTypeAnnotation === undefined) {
        return false;
    }

    const baseType = unwrapParenthesizedTypeNode(constraintTypeAnnotation);
    const indexedValueType = node.typeAnnotation;

    if (indexedValueType === undefined) {
        return false;
    }

    if (
        indexedValueType.type !== AST_NODE_TYPES.TSIndexedAccessType ||
        !areEquivalentTypeNodes(
            unwrapParenthesizedTypeNode(indexedValueType.objectType),
            baseType
        ) ||
        indexedValueType.indexType.type !== AST_NODE_TYPES.TSTypeReference ||
        indexedValueType.indexType.typeName.type !==
            AST_NODE_TYPES.Identifier ||
        indexedValueType.indexType.typeName.name !== node.key.name
    ) {
        return false;
    }

    const keyRemapType = node.nameType;

    if (keyRemapType?.type !== AST_NODE_TYPES.TSConditionalType) {
        return false;
    }

    if (
        !isEmptyObjectTypeLiteral(
            unwrapParenthesizedTypeNode(keyRemapType.checkType)
        ) ||
        keyRemapType.falseType.type !== AST_NODE_TYPES.TSNeverKeyword ||
        keyRemapType.trueType.type !== AST_NODE_TYPES.TSTypeReference ||
        keyRemapType.trueType.typeName.type !== AST_NODE_TYPES.Identifier ||
        keyRemapType.trueType.typeName.name !== node.key.name
    ) {
        return false;
    }

    const normalizedExtendsType = unwrapParenthesizedTypeNode(
        keyRemapType.extendsType
    );

    if (
        normalizedExtendsType.type !== AST_NODE_TYPES.TSTypeReference ||
        !isIdentifierTypeReference(normalizedExtendsType, "Record")
    ) {
        return false;
    }

    const recordTypeArguments = normalizedExtendsType.typeArguments?.params;

    if (recordTypeArguments?.length !== 2) {
        return false;
    }

    const [recordKeyType, recordValueType] = recordTypeArguments;

    return (
        recordKeyType !== undefined &&
        recordValueType?.type === AST_NODE_TYPES.TSUnknownKeyword &&
        recordKeyType.type === AST_NODE_TYPES.TSTypeReference &&
        recordKeyType.typeName.type === AST_NODE_TYPES.Identifier &&
        recordKeyType.typeName.name === node.key.name
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-pick-index-signature`.
 */
const preferTypeFestPickIndexSignatureRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return {
                TSMappedType(node) {
                    if (!hasPickIndexSignatureMappedTypeShape(node)) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferPickIndexSignature",
                        node,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest PickIndexSignature over manual mapped types that keep only index signatures.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: ["typefest.configs.experimental"],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-pick-index-signature",
            },
            messages: {
                preferPickIndexSignature:
                    "Prefer `PickIndexSignature<ObjectType>` from type-fest over manual mapped types that keep only index signatures.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-pick-index-signature",
    });

export default preferTypeFestPickIndexSignatureRule;
