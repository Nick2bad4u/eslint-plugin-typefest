/** @packageDocumentation ESLint rule for AsyncFunction. */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

import { isGlobalTypeReferenceNamed } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";
import { createUpstreamTypeReporter } from "../_internal/upstream-type-replacement.js";

const isReadonlyArrayOrTuple = (
    node: Readonly<TSESTree.TypeNode>
): node is TSESTree.TSTypeOperator & {
    typeAnnotation: TSESTree.TSArrayType | TSESTree.TSTupleType;
} =>
    node.type === AST_NODE_TYPES.TSTypeOperator &&
    node.operator === "readonly" &&
    (node.typeAnnotation?.type === AST_NODE_TYPES.TSArrayType ||
        node.typeAnnotation?.type === AST_NODE_TYPES.TSTupleType);

const isAnyRestArray = (node: Readonly<TSESTree.TypeNode>): boolean => {
    const array = isReadonlyArrayOrTuple(node) ? node.typeAnnotation : node;
    return (
        array.type === AST_NODE_TYPES.TSArrayType &&
        array.elementType.type === AST_NODE_TYPES.TSAnyKeyword
    );
};

const getRestAnnotation = (
    node: Readonly<TSESTree.TSFunctionType>
): TSESTree.TypeNode | undefined => {
    if (
        node.parent.type !== AST_NODE_TYPES.TSTypeAliasDeclaration ||
        node.typeParameters !== undefined ||
        node.params.length !== 1
    )
        return undefined;
    const [rest] = node.params;
    return rest?.type === AST_NODE_TYPES.RestElement
        ? rest.typeAnnotation?.typeAnnotation
        : undefined;
};

const isSimpleResult = (node: TSESTree.TypeNode): boolean =>
    node.type.endsWith("Keyword") ||
    (node.type === AST_NODE_TYPES.TSTypeReference &&
        node.typeArguments === undefined &&
        node.typeName.type === AST_NODE_TYPES.Identifier);

/**
 * Prefer TypeFest function types for canonical rest-argument function
 * signatures.
 */
const preferTypeFestFunctionRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const report = createUpstreamTypeReporter(context);
            return {
                TSFunctionType(node) {
                    const args = getRestAnnotation(node);
                    const result = node.returnType?.typeAnnotation;
                    if (!args || !result) return;
                    const anyArgs = isAnyRestArray(args);
                    if (
                        anyArgs &&
                        result.type === AST_NODE_TYPES.TSUnknownKeyword
                    ) {
                        report(node, "AnyFunction");
                        return;
                    }
                    if (
                        !isGlobalTypeReferenceNamed(
                            context,
                            result,
                            "Promise"
                        ) ||
                        result.typeArguments?.params.length !== 1
                    )
                        return;
                    const [value] = result.typeArguments.params;
                    if (!value || !isSimpleResult(value)) return;
                    if (
                        anyArgs &&
                        value.type === AST_NODE_TYPES.TSUnknownKeyword
                    ) {
                        report(node, "AnyAsyncFunction");
                    } else if (
                        args.type === AST_NODE_TYPES.TSTupleType ||
                        args.type === AST_NODE_TYPES.TSArrayType ||
                        args.type === AST_NODE_TYPES.TSTypeReference ||
                        isReadonlyArrayOrTuple(args)
                    ) {
                        report(
                            node,
                            "AsyncFunction",
                            context.sourceCode.getText(args),
                            context.sourceCode.getText(value)
                        );
                    }
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest function types for canonical rest-argument function signatures.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                requiresUpstream: "type-fest@6",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-function",
            },
            fixable: "code",
            messages: {
                preferUpstreamType:
                    "Use `{{replacement}}` from type-fest for this type expression.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-function",
    });
export default preferTypeFestFunctionRule;
