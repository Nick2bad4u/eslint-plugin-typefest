/** @packageDocumentation Recognize a distributive hand-written predicate target extractor. */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayIncludes } from "ts-extras";

import { isTypeParameterReference } from "../_internal/type-parameter-reference.js";
import { createTypedRule } from "../_internal/typed-rule.js";
import { createUpstreamTypeReporter } from "../_internal/upstream-type-replacement.js";

/** Identify the required first parameter of a compatible variadic signature. */
const getGuardedParameter = (
    signature: Readonly<TSESTree.TSFunctionType>
): TSESTree.Identifier | undefined => {
    if (
        signature.typeParameters !== undefined ||
        signature.params.length !== 2
    ) {
        return undefined;
    }
    const [value, rest] = signature.params;
    if (
        value?.type !== AST_NODE_TYPES.Identifier ||
        value.name === "this" ||
        value.optional ||
        value.typeAnnotation?.typeAnnotation.type !==
            AST_NODE_TYPES.TSAnyKeyword ||
        rest?.type !== AST_NODE_TYPES.RestElement ||
        rest.argument.type !== AST_NODE_TYPES.Identifier ||
        rest.argument.name === value.name ||
        rest.optional ||
        rest.typeAnnotation?.typeAnnotation.type !==
            AST_NODE_TYPES.TSArrayType ||
        rest.typeAnnotation.typeAnnotation.elementType.type !==
            AST_NODE_TYPES.TSAnyKeyword
    ) {
        return undefined;
    }
    return value;
};

/** Verify the predicate and inferred type bindings. */
const getInferredTarget = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    signature: Readonly<TSESTree.TSFunctionType>
): TSESTree.TSTypeParameter | undefined => {
    const value = getGuardedParameter(signature);
    const predicate = signature.returnType?.typeAnnotation;
    if (
        !value ||
        predicate?.type !== AST_NODE_TYPES.TSTypePredicate ||
        predicate.asserts ||
        predicate.typeAnnotation.typeAnnotation.type !==
            AST_NODE_TYPES.TSInferType
    ) {
        return undefined;
    }
    const inferred = predicate.typeAnnotation.typeAnnotation.typeParameter;
    const matchesParameter = sourceCode
        .getDeclaredVariables(signature)
        .some(
            (variable) =>
                arrayIncludes(variable.identifiers, value) &&
                variable.references.some(
                    ({ identifier }) => identifier === predicate.parameterName
                )
        );
    return matchesParameter && !inferred.constraint ? inferred : undefined;
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
