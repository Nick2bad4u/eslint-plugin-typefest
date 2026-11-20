import type { UnknownArray } from "type-fest";

/** @packageDocumentation Shared reporting for equivalent upstream type expressions. */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayFirst, arrayJoin } from "ts-extras";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "./imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "./module-source.js";
import { reportWithOptionalFix } from "./rule-reporting.js";
import { getVariableInScopeChain } from "./scope-variable.js";

/**
 * Preserve comments and let the normal import planner handle collisions and
 * local bindings.
 */
export const createUpstreamTypeReporter = (
    context: Readonly<TSESLint.RuleContext<"preferUpstreamType", UnknownArray>>
) => {
    const imports = collectDirectNamedImportsFromSource(
        context.sourceCode,
        TYPE_FEST_MODULE_SOURCE
    );
    return (
        node: TSESTree.TypeNode,
        typeName: string,
        ...args: readonly string[]
    ): boolean => {
        if (
            context.sourceCode
                .getAncestors(node)
                .some(
                    (ancestor) =>
                        ancestor.type === AST_NODE_TYPES.TSConditionalType &&
                        arrayFirst(ancestor.extendsType.range) <=
                            arrayFirst(node.range) &&
                        ancestor.extendsType.range[1] >= node.range[1]
                )
        )
            return false;
        const replacement =
            args.length === 0
                ? typeName
                : `${typeName}<${arrayJoin(args, ", ")}>`;
        const binding = getVariableInScopeChain(
            context.sourceCode.getScope(node),
            typeName
        );
        const canUseName =
            binding === null ||
            binding.defs.some(
                (def) =>
                    def.parent?.type === AST_NODE_TYPES.ImportDeclaration &&
                    def.parent.source.value === TYPE_FEST_MODULE_SOURCE &&
                    def.node.type === AST_NODE_TYPES.ImportSpecifier &&
                    def.node.imported.type === AST_NODE_TYPES.Identifier &&
                    def.node.imported.name === typeName
            );
        const fix =
            canUseName &&
            context.sourceCode.getCommentsInside(node).length === 0
                ? createSafeTypeNodeTextReplacementFix(
                      node,
                      typeName,
                      replacement,
                      imports
                  )
                : null;
        reportWithOptionalFix({
            context,
            data: { replacement },
            fix,
            messageId: "preferUpstreamType",
            node,
        });
        return true;
    };
};
