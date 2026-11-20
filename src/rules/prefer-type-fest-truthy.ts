/** @packageDocumentation ESLint rule for Truthy. */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { arrayAt, arrayFirst } from "ts-extras";

import { isTypeFestImport } from "../_internal/type-fest-import-reference.js";
import { isGlobalTypeReferenceNamed } from "../_internal/type-reference-node.js";
import {
    createTypedRule,
    type TypedRuleContext,
} from "../_internal/typed-rule.js";
import { createUpstreamTypeReporter } from "../_internal/upstream-type-replacement.js";

/** Require both void and the actual imported Falsy type, in either order. */
const isFalsyAndVoid = (
    context: TypedRuleContext,
    removed: Readonly<TSESTree.TypeNode> | undefined
): boolean =>
    removed?.type === AST_NODE_TYPES.TSUnionType &&
    removed.types.length === 2 &&
    removed.types.some((type) => type.type === AST_NODE_TYPES.TSVoidKeyword) &&
    removed.types.some(
        (type) =>
            type.type === AST_NODE_TYPES.TSTypeReference &&
            type.typeArguments === undefined &&
            isTypeFestImport(context.sourceCode, type, "Falsy")
    );

/** Extract the preserved operand from the native Exclude utility. */
const getTruthyInput = (
    context: TypedRuleContext,
    excluded: Readonly<TSESTree.TypeNode> | undefined
) => {
    if (
        !excluded ||
        !isGlobalTypeReferenceNamed(context, excluded, "Exclude") ||
        excluded.typeArguments?.params.length !== 2
    )
        return undefined;
    const { params } = excluded.typeArguments;
    return isFalsyAndVoid(context, arrayAt(params, 1))
        ? arrayFirst(params)
        : undefined;
};

/**
 * Prefer TypeFest Truthy for the complete non-nullable exclusion of Falsy and
 * void.
 */
const preferTypeFestTruthyRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const report = createUpstreamTypeReporter(context);
            return {
                'TSTypeReference[typeName.name="NonNullable"]'(
                    node: TSESTree.TSTypeReference
                ) {
                    if (
                        !isGlobalTypeReferenceNamed(
                            context,
                            node,
                            "NonNullable"
                        ) ||
                        node.typeArguments?.params.length !== 1
                    )
                        return;
                    const input = getTruthyInput(
                        context,
                        arrayFirst(node.typeArguments.params)
                    );
                    if (input)
                        report(
                            node,
                            "Truthy",
                            context.sourceCode.getText(input)
                        );
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest Truthy for the complete non-nullable exclusion of Falsy and void.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                requiresUpstream: "type-fest@6",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-truthy",
            },
            fixable: "code",
            messages: {
                preferUpstreamType:
                    "Use `{{replacement}}` from type-fest for this type expression.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-truthy",
    });
export default preferTypeFestTruthyRule;
