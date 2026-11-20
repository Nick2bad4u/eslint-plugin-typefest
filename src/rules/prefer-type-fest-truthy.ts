/** @packageDocumentation ESLint rule for Truthy. */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

import { isTypeFestImport } from "../_internal/type-fest-import-reference.js";
import { isGlobalTypeReferenceNamed } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";
import { createUpstreamTypeReporter } from "../_internal/upstream-type-replacement.js";

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
                    const [excluded] = node.typeArguments.params;
                    if (
                        !excluded ||
                        !isGlobalTypeReferenceNamed(
                            context,
                            excluded,
                            "Exclude"
                        ) ||
                        excluded.typeArguments?.params.length !== 2
                    )
                        return;
                    const [input, removed] = excluded.typeArguments.params;
                    if (
                        input &&
                        removed?.type === AST_NODE_TYPES.TSUnionType &&
                        removed.types.length === 2 &&
                        removed.types.some(
                            (t) => t.type === AST_NODE_TYPES.TSVoidKeyword
                        ) &&
                        removed.types.some(
                            (t) =>
                                t.type === AST_NODE_TYPES.TSTypeReference &&
                                !t.typeArguments &&
                                isTypeFestImport(context.sourceCode, t, "Falsy")
                        )
                    ) {
                        report(
                            node,
                            "Truthy",
                            context.sourceCode.getText(input)
                        );
                    }
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
