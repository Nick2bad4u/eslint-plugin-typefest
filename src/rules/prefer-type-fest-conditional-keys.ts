import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-conditional-keys`.
 */
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { areEquivalentTypeNodes } from "../_internal/normalize-expression-text.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { unwrapParenthesizedTypeNode } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const hasConditionalKeysKeyRemapShape = (
    node: Readonly<TSESTree.TSTypeOperator>
): boolean => {
    if (node.operator !== "keyof" || node.typeAnnotation === undefined) {
        return false;
    }

    const normalizedOperand = unwrapParenthesizedTypeNode(node.typeAnnotation);

    if (normalizedOperand.type !== AST_NODE_TYPES.TSMappedType) {
        return false;
    }

    const mappedKeyName = normalizedOperand.key.name;
    const constraint = normalizedOperand.constraint;

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
    const keyRemapType = normalizedOperand.nameType;

    if (keyRemapType?.type !== AST_NODE_TYPES.TSConditionalType) {
        return false;
    }

    const checkedValueType = unwrapParenthesizedTypeNode(
        keyRemapType.checkType
    );

    if (checkedValueType.type !== AST_NODE_TYPES.TSIndexedAccessType) {
        return false;
    }
    if (
        !areEquivalentTypeNodes(
            unwrapParenthesizedTypeNode(checkedValueType.objectType),
            baseType
        )
    ) {
        return false;
    }
    const checkedIndexType = checkedValueType.indexType;
    if (
        checkedIndexType.type !== AST_NODE_TYPES.TSTypeReference ||
        checkedIndexType.typeName.type !== AST_NODE_TYPES.Identifier ||
        checkedIndexType.typeName.name !== mappedKeyName
    ) {
        return false;
    }

    return (
        keyRemapType.trueType.type === AST_NODE_TYPES.TSTypeReference &&
        keyRemapType.trueType.typeName.type === AST_NODE_TYPES.Identifier &&
        keyRemapType.trueType.typeName.name === mappedKeyName &&
        keyRemapType.falseType.type === AST_NODE_TYPES.TSNeverKeyword
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-conditional-keys`.
 */
const preferTypeFestConditionalKeysRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return {
                TSTypeOperator(node) {
                    if (!hasConditionalKeysKeyRemapShape(node)) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferConditionalKeys",
                        node,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest ConditionalKeys over keyof-remapped mapped types that filter keys by value condition.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: ["typefest.configs.experimental"],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-conditional-keys",
            },
            messages: {
                preferConditionalKeys:
                    "Prefer `ConditionalKeys<Base, Condition>` from type-fest over manual `keyof { [K in keyof Base as Base[K] extends Condition ? K : never]: ... }` key filters.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-conditional-keys",
    });

export default preferTypeFestConditionalKeysRule;
