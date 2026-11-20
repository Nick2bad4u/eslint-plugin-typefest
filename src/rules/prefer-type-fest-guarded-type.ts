/** @packageDocumentation Recognize a distributive hand-written predicate target extractor. */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayAt, arrayFirst, arrayIncludes } from "ts-extras";

import { isTypeParameterReference } from "../_internal/type-parameter-reference.js";
import { createTypedRule } from "../_internal/typed-rule.js";
import { createUpstreamTypeReporter } from "../_internal/upstream-type-replacement.js";

/** Require an ordinary variadic parameter typed as any[]. */
const hasAnyRestParameter = (
    signature: Readonly<TSESTree.TSFunctionType>,
    firstName: string
): boolean => {
    const rest = arrayAt(signature.params, 1);
    return (
        rest?.type === AST_NODE_TYPES.RestElement &&
        rest.argument.type === AST_NODE_TYPES.Identifier &&
        rest.argument.name !== firstName &&
        !rest.optional &&
        rest.typeAnnotation?.typeAnnotation.type ===
            AST_NODE_TYPES.TSArrayType &&
        rest.typeAnnotation.typeAnnotation.elementType.type ===
            AST_NODE_TYPES.TSAnyKeyword
    );
};

/** Identify the required first parameter of a compatible variadic signature. */
const getGuardedParameter = (
    signature: Readonly<TSESTree.TSFunctionType>
): TSESTree.Identifier | undefined => {
    const value = arrayFirst(signature.params);
    if (
        value?.type !== AST_NODE_TYPES.Identifier ||
        value.name === "this" ||
        value.optional ||
        value.typeAnnotation?.typeAnnotation.type !==
            AST_NODE_TYPES.TSAnyKeyword ||
        !hasAnyRestParameter(signature, value.name)
    ) {
        return undefined;
    }
    return value;
};

/** Read a predicate that infers a type from a two-parameter signature. */
const getPredicateBinding = (signature: Readonly<TSESTree.TSFunctionType>) => {
    const predicate = signature.returnType?.typeAnnotation;
    if (
        signature.typeParameters !== undefined ||
        signature.params.length !== 2 ||
        predicate?.type !== AST_NODE_TYPES.TSTypePredicate ||
        predicate.asserts ||
        predicate.typeAnnotation.typeAnnotation.type !==
            AST_NODE_TYPES.TSInferType
    ) {
        return undefined;
    }
    const inferred = predicate.typeAnnotation.typeAnnotation.typeParameter;
    return { inferred, name: predicate.parameterName };
};

/** Verify that the predicate actually refers to its first parameter. */
const getInferredTarget = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    signature: Readonly<TSESTree.TSFunctionType>
): TSESTree.TSTypeParameter | undefined => {
    const value = getGuardedParameter(signature);
    const binding = getPredicateBinding(signature);
    if (!value || !binding || binding.inferred.constraint !== undefined) {
        return undefined;
    }
    const matchesParameter = sourceCode
        .getDeclaredVariables(signature)
        .some(
            (variable) =>
                arrayIncludes(variable.identifiers, value) &&
                variable.references.some(
                    ({ identifier }) => identifier === binding.name
                )
        );
    return matchesParameter ? binding.inferred : undefined;
};

/** ESLint rule definition for `prefer-type-fest-guarded-type`. */
const preferTypeFestGuardedTypeRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const report = createUpstreamTypeReporter(context);
            const { sourceCode } = context;
            return {
                TSTypeAliasDeclaration(node) {
                    const conditional = node.typeAnnotation;
                    if (
                        conditional.type !== AST_NODE_TYPES.TSConditionalType ||
                        conditional.extendsType.type !==
                            AST_NODE_TYPES.TSFunctionType ||
                        conditional.falseType.type !==
                            AST_NODE_TYPES.TSNeverKeyword
                    ) {
                        return;
                    }
                    const input = node.typeParameters?.params.find(
                        (parameter) =>
                            isTypeParameterReference(
                                sourceCode,
                                parameter,
                                conditional.checkType
                            )
                    );
                    const target = getInferredTarget(
                        sourceCode,
                        conditional.extendsType
                    );
                    if (
                        input &&
                        target &&
                        isTypeParameterReference(
                            sourceCode,
                            target,
                            conditional.trueType
                        )
                    ) {
                        report(conditional, "GuardedType", input.name.name);
                    }
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest GuardedType over distributive extraction of a type predicate target.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                requiresUpstream: "type-fest@6",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-guarded-type",
            },
            fixable: "code",
            messages: {
                preferUpstreamType:
                    "Use `{{replacement}}` from type-fest for this type expression.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-guarded-type",
    });
export default preferTypeFestGuardedTypeRule;
