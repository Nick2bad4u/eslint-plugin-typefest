import { AST_NODE_TYPES } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-thunkable`.
 */
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { isTypeParameterReference } from "../_internal/type-parameter-reference.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Require TypeFest Thunkable for an alias wrapping its parameter in a thunk. */
const preferTypeFestThunkableRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return {
                TSTypeAliasDeclaration(node) {
                    const parameters = node.typeParameters?.params;
                    const union = node.typeAnnotation;
                    if (
                        parameters?.length !== 1 ||
                        union.type !== AST_NODE_TYPES.TSUnionType ||
                        union.types.length !== 2
                    ) {
                        return;
                    }

                    const [parameter] = parameters;
                    const thunk = union.types.find(
                        (member) =>
                            member.type === AST_NODE_TYPES.TSFunctionType
                    );
                    const returned = thunk?.returnType?.typeAnnotation;
                    if (
                        !parameter ||
                        !returned ||
                        thunk.params.length > 0 ||
                        thunk.typeParameters !== undefined ||
                        !isTypeParameterReference(
                            context.sourceCode,
                            parameter,
                            returned
                        ) ||
                        union.types.every(
                            (member) =>
                                !isTypeParameterReference(
                                    context.sourceCode,
                                    parameter,
                                    member
                                )
                        )
                    ) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        data: { parameter: parameter.name.name },
                        fix: null,
                        messageId: "preferThunkable",
                        node: union,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest Thunkable over generic value-or-thunk aliases.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                requiresUpstream: "type-fest@6",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-thunkable",
            },
            messages: {
                preferThunkable:
                    "Use `Thunkable<{{parameter}}>` from type-fest for a value or a zero-argument function returning that value.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-thunkable",
    });

export default preferTypeFestThunkableRule;
