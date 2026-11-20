/**
 * @packageDocumentation
 * Match the public Type-fest overload helpers' underlying type expressions.
 */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayFirst } from "ts-extras";

import { isTypeFestImport } from "./type-fest-import-reference.js";
import { isGlobalTypeReferenceNamed } from "./type-reference-node.js";
import { createTypedRule } from "./typed-rule.js";
import { createUpstreamTypeReporter } from "./upstream-type-replacement.js";

// A specialized rule visits the wrapper before ArrayElement visits its child.
const reportedIndices = new WeakMap<
    TSESTree.Program,
    WeakSet<TSESTree.TSIndexedAccessType>
>();

/** True only when an enabled overload rule reported this index on this pass. */
export const isReportedOverloadIndex = (
    program: TSESTree.Program,
    node: Readonly<TSESTree.TSIndexedAccessType>
): boolean => reportedIndices.get(program)?.has(node) === true;

/** Read the input of an exact `Overloads<Input>[number]` reference. */
const getOverloadProjection = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    wrapper: Readonly<TSESTree.TSTypeReference>
):
    | undefined
    | { access: TSESTree.TSIndexedAccessType; input: TSESTree.TypeNode } => {
    const args = wrapper.typeArguments?.params;
    if (args?.length !== 1) return undefined;
    const access = arrayFirst(args);
    if (
        access?.type !== AST_NODE_TYPES.TSIndexedAccessType ||
        access.indexType.type !== AST_NODE_TYPES.TSNumberKeyword ||
        access.objectType.type !== AST_NODE_TYPES.TSTypeReference ||
        access.objectType.typeArguments?.params.length !== 1 ||
        !isTypeFestImport(sourceCode, access.objectType, "Overloads")
    ) {
        return undefined;
    }
    const input = arrayFirst(access.objectType.typeArguments.params);
    return input && { access, input };
};

/** Create a rule for one of the two upstream overload extraction helpers. */
export const createPreferTypeFestOverloadRule = (
    kind: "parameters" | "return-type"
): ReturnType<typeof createTypedRule> => {
    const ruleName = `prefer-type-fest-overload-${kind}` as const;
    const helper =
        kind === "parameters" ? "OverloadParameters" : "OverloadReturnType";
    const wrapper = kind === "parameters" ? "FunctionParameters" : "ReturnType";
    return createTypedRule({
        create(context) {
            const { sourceCode } = context;
            const report = createUpstreamTypeReporter(context);
            const indices =
                reportedIndices.get(sourceCode.ast) ??
                new WeakSet<TSESTree.TSIndexedAccessType>();
            reportedIndices.set(sourceCode.ast, indices);
            return {
                "Program:exit"() {
                    reportedIndices.delete(sourceCode.ast);
                },
                "TSTypeReference[typeArguments.params.length=1]"(
                    node: TSESTree.TSTypeReference
                ) {
                    const projection = getOverloadProjection(sourceCode, node);
                    if (!projection) return;
                    const matches =
                        kind === "parameters"
                            ? isTypeFestImport(
                                  sourceCode,
                                  node,
                                  "FunctionParameters"
                              )
                            : isGlobalTypeReferenceNamed(
                                  context,
                                  node,
                                  "ReturnType"
                              );
                    if (
                        matches &&
                        report(
                            node,
                            helper,
                            sourceCode.getText(projection.input)
                        )
                    ) {
                        indices.add(projection.access);
                    }
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description: `require TypeFest ${helper} over ${wrapper}<Overloads<F>[number]>.`,
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                requiresUpstream: "type-fest@6",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: `https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/${ruleName}`,
            },
            fixable: "code",
            messages: {
                preferUpstreamType:
                    "Use `{{replacement}}` from type-fest to extract types from all overloads.",
            },
            schema: [],
            type: "suggestion",
        },
        name: ruleName,
    });
};
