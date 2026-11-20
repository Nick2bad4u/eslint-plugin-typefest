import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { arrayAt, arrayFirst, arrayLast } from "ts-extras";

import type { TypedRuleContext } from "./typed-rule.js";

import { isGlobalTypeReferenceNamed } from "./type-reference-node.js";

/** Match exactly the pattern that selects every string beginning with set. */
const matchesSetterKey = (
    keys: Readonly<TSESTree.TSTemplateLiteralType>
): boolean =>
    keys.types.length === 1 &&
    arrayFirst(keys.quasis)?.value.cooked === "set" &&
    arrayLast(keys.quasis)?.value.cooked === "" &&
    arrayFirst(keys.types)?.type === AST_NODE_TYPES.TSStringKeyword;

/** Read the global Date when a built-in Omit removes every set-prefixed key. */
export const getDateWithoutSetters = (
    context: TypedRuleContext,
    node: Readonly<TSESTree.TSTypeReference>
): TSESTree.TSTypeReference | undefined => {
    if (node.typeArguments?.params.length !== 2) {
        return undefined;
    }
    const date = arrayFirst(node.typeArguments.params);
    const keys = arrayAt(node.typeArguments.params, 1);
    if (
        !date ||
        keys?.type !== AST_NODE_TYPES.TSTemplateLiteralType ||
        !matchesSetterKey(keys) ||
        !isGlobalTypeReferenceNamed(context, date, "Date") ||
        date.typeArguments !== undefined
    ) {
        return undefined;
    }
    return date;
};
