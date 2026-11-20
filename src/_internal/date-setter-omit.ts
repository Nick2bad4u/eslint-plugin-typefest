import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

import type { TypedRuleContext } from "./typed-rule.js";

import { isGlobalTypeReferenceNamed } from "./type-reference-node.js";

/** Read the global Date when a built-in Omit removes every set-prefixed key. */
export const getDateWithoutSetters = (
    context: TypedRuleContext,
    node: Readonly<TSESTree.TSTypeReference>
): TSESTree.TSTypeReference | undefined => {
    if (node.typeArguments?.params.length !== 2) {
        return undefined;
    }
    const [date, keys] = node.typeArguments.params;
    if (
        !date ||
        keys?.type !== AST_NODE_TYPES.TSTemplateLiteralType ||
        keys.types.length !== 1 ||
        !isGlobalTypeReferenceNamed(context, date, "Date") ||
        date.typeArguments !== undefined
    ) {
        return undefined;
    }
    const [prefix, suffix] = keys.quasis;
    const [substitution] = keys.types;
    return prefix?.value.cooked === "set" &&
        suffix?.value.cooked === "" &&
        substitution?.type === AST_NODE_TYPES.TSStringKeyword
        ? date
        : undefined;
};
