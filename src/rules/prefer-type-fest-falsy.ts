/** @packageDocumentation ESLint rule for Falsy. */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { setHas } from "ts-extras";

import { setContainsValue } from "../_internal/set-membership.js";
import { createTypedRule } from "../_internal/typed-rule.js";
import { createUpstreamTypeReporter } from "../_internal/upstream-type-replacement.js";

const falsyLiterals = new Set([
    "",
    0,
    0n,
    false,
] as const);

const falsyMember = (
    node: Readonly<TSESTree.TypeNode>
):
    | bigint
    | boolean
    | number
    | string
    | undefined => {
    if (
        node.type === AST_NODE_TYPES.TSNullKeyword ||
        node.type === AST_NODE_TYPES.TSUndefinedKeyword
    )
        return node.type;
    if (
        node.type !== AST_NODE_TYPES.TSLiteralType ||
        node.literal.type !== AST_NODE_TYPES.Literal
    )
        return undefined;
    const { value } = node.literal;
    return setHas(falsyLiterals, value) ? value : undefined;
};

/** Prefer the TypeFest Falsy type for the complete union of falsy literal types. */
const preferTypeFestFalsyRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const report = createUpstreamTypeReporter(context);
            return {
                TSUnionType(node) {
                    if (node.types.length !== 6) return;
                    const members = new Set(
                        node.types.map((member) => falsyMember(member))
                    );
                    if (
                        members.size === 6 &&
                        !setContainsValue(members, undefined)
                    ) {
                        report(node, "Falsy");
                    }
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest Falsy type for the complete union of falsy literal types.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                requiresUpstream: "type-fest@6",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-falsy",
            },
            fixable: "code",
            messages: {
                preferUpstreamType:
                    "Use `{{replacement}}` from type-fest for this type expression.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-falsy",
    });
export default preferTypeFestFalsyRule;
