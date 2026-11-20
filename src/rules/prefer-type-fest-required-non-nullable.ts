/**
 * @packageDocumentation
 * Prefer RequiredNonNullable over its homomorphic required-property mapping.
 */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { isDefined } from "ts-extras";

import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { isTypeParameterReference } from "../_internal/type-parameter-reference.js";
import { isGlobalTypeReferenceNamed } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Match a required mapped type that preserves keys and readonly modifiers. */
const isRequiredKeyofMap = (
    node: Readonly<TSESTree.TSMappedType>
): node is TSESTree.TSMappedType & {
    constraint: TSESTree.TSTypeOperator & { typeAnnotation: TSESTree.TypeNode };
    typeAnnotation: TSESTree.TSTypeReference;
} =>
    node.optional === "-" &&
    !isDefined(node.readonly) &&
    node.nameType === null &&
    node.constraint.type === AST_NODE_TYPES.TSTypeOperator &&
    node.constraint.operator === "keyof" &&
    isDefined(node.constraint.typeAnnotation) &&
    node.typeAnnotation?.type === AST_NODE_TYPES.TSTypeReference;

/** Check that the sole utility argument reads exactly the mapped property. */
const hasMappedPropertyArgument = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    input: Readonly<TSESTree.TSTypeParameter>,
    mapped: Readonly<TSESTree.TSMappedType>,
    value: Readonly<TSESTree.TSTypeReference>
): boolean => {
    const args = value.typeArguments?.params;
    return (
        args?.length === 1 &&
        args.some(
            (access) =>
                access.type === AST_NODE_TYPES.TSIndexedAccessType &&
                isTypeParameterReference(
                    sourceCode,
                    input,
                    access.objectType
                ) &&
                isTypeParameterReference(sourceCode, mapped, access.indexType)
        )
    );
};

/** Rule definition for prefer-type-fest-required-non-nullable. */
const preferTypeFestRequiredNonNullableRule: ReturnType<
    typeof createTypedRule
> = createTypedRule({
    create(context) {
        const { sourceCode } = context;
        return {
            'TSTypeAliasDeclaration[typeAnnotation.type="TSMappedType"]'(
                node: Readonly<
                    TSESTree.TSTypeAliasDeclaration & {
                        typeAnnotation: TSESTree.TSMappedType;
                    }
                >
            ) {
                const parameters = node.typeParameters;
                const mapped = node.typeAnnotation;
                if (
                    parameters?.params.length !== 1 ||
                    !isRequiredKeyofMap(mapped)
                ) {
                    return;
                }
                const [input] = parameters.params;
                const value = mapped.typeAnnotation;
                if (
                    !input ||
                    !isTypeParameterReference(
                        sourceCode,
                        input,
                        mapped.constraint.typeAnnotation
                    ) ||
                    !hasMappedPropertyArgument(
                        sourceCode,
                        input,
                        mapped,
                        value
                    ) ||
                    !isGlobalTypeReferenceNamed(context, value, "NonNullable")
                ) {
                    return;
                }
                reportWithOptionalFix({
                    context,
                    fix: null,
                    messageId: "preferRequiredNonNullable",
                    node: mapped,
                });
            },
        };
    },
    meta: {
        deprecated: false,
        docs: {
            description:
                "require TypeFest RequiredNonNullable over a required mapped type that removes nullable property values.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            requiresUpstream: "type-fest@6",
            typefestConfigs: [
                "typefest.configs.all",
                "typefest.configs.experimental",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-required-non-nullable",
        },
        messages: {
            preferRequiredNonNullable:
                "Use `RequiredNonNullable` from type-fest to require every property and remove null and undefined from its value.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "prefer-type-fest-required-non-nullable",
});
export default preferTypeFestRequiredNonNullableRule;
