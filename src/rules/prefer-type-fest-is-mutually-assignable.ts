/** @packageDocumentation ESLint rule for IsMutuallyAssignable. */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isDefined } from "ts-extras";

import {
    getSingleTupleElementType,
    hasTrueFalseBranches,
    isBooleanLiteralType,
} from "../_internal/type-guard-conditional-patterns.js";
import { createTypedRule } from "../_internal/typed-rule.js";
import { createUpstreamTypeReporter } from "../_internal/upstream-type-replacement.js";

const tupleName = (node: Readonly<TSESTree.TypeNode>): string | undefined => {
    const item = getSingleTupleElementType(node);
    return item?.type === AST_NODE_TYPES.TSTypeReference &&
        item.typeName.type === AST_NODE_TYPES.Identifier &&
        !item.typeArguments
        ? item.typeName.name
        : undefined;
};

/**
 * Prefer TypeFest IsMutuallyAssignable for symmetric tuple-wrapped
 * assignability tests.
 */
const preferTypeFestIsMutuallyAssignableRule: ReturnType<
    typeof createTypedRule
> = createTypedRule({
    create(context) {
        const report = createUpstreamTypeReporter(context);
        return {
            TSConditionalType(node) {
                const inner = node.trueType;
                if (
                    inner.type !== AST_NODE_TYPES.TSConditionalType ||
                    !isBooleanLiteralType(node.falseType, false) ||
                    !hasTrueFalseBranches(inner)
                )
                    return;
                const left = tupleName(node.checkType);
                const right = tupleName(node.extendsType);
                if (
                    left !== right &&
                    isDefined(left) &&
                    isDefined(right) &&
                    tupleName(inner.checkType) === right &&
                    tupleName(inner.extendsType) === left
                ) {
                    report(node, "IsMutuallyAssignable", left, right);
                }
            },
        };
    },
    meta: {
        deprecated: false,
        docs: {
            description:
                "require TypeFest IsMutuallyAssignable for symmetric tuple-wrapped assignability tests.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            requiresUpstream: "type-fest@6",
            typefestConfigs: [
                "typefest.configs.all",
                "typefest.configs.experimental",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-is-mutually-assignable",
        },
        fixable: "code",
        messages: {
            preferUpstreamType:
                "Use `{{replacement}}` from type-fest for this type expression.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "prefer-type-fest-is-mutually-assignable",
});
export default preferTypeFestIsMutuallyAssignableRule;
