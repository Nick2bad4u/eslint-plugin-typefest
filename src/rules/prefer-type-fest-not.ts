/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-not`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { isTypeFestImport } from "../_internal/type-fest-import-reference.js";
import { isBooleanLiteralType } from "../_internal/type-guard-conditional-patterns.js";
import { createTypedRule } from "../_internal/typed-rule.js";
import { createUpstreamTypeReporter } from "../_internal/upstream-type-replacement.js";

const hasThreeTypeArguments = (
    args: readonly TSESTree.TypeNode[] | undefined
): args is readonly [
    TSESTree.TypeNode,
    TSESTree.TypeNode,
    TSESTree.TypeNode,
] => args?.length === 3;

/** Recognize the exact TypeFest If composition used to define Not. */
const rule: ReturnType<typeof createTypedRule> = createTypedRule({
    create(context) {
        const report = createUpstreamTypeReporter(context);
        return {
            "TSTypeReference[typeArguments.params.length=3]"(
                node: TSESTree.TSTypeReference
            ) {
                const args = node.typeArguments?.params;
                if (!hasThreeTypeArguments(args)) return;
                const [
                    condition,
                    ifTrue,
                    ifFalse,
                ] = args;
                if (
                    isBooleanLiteralType(ifTrue, false) &&
                    isBooleanLiteralType(ifFalse, true) &&
                    isTypeFestImport(context.sourceCode, node, "If")
                ) {
                    report(node, "Not", context.sourceCode.getText(condition));
                }
            },
        };
    },
    meta: {
        deprecated: false,
        docs: {
            description:
                "require TypeFest Not for a TypeFest If that negates a boolean.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            requiresUpstream: "type-fest@6",
            typefestConfigs: [
                "typefest.configs.all",
                "typefest.configs.experimental",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-not",
        },
        fixable: "code",
        messages: {
            preferUpstreamType:
                "Use `{{replacement}}` from type-fest for this boolean negation.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "prefer-type-fest-not",
});
export default rule;
