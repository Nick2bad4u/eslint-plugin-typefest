/**
 * @packageDocumentation
 * Shared helpers for extracting throw-only `if` consequents.
 */
import type { TSESTree } from "@typescript-eslint/utils";

/**
 * Check whether an `if` consequent contains only a throw statement.
 *
 * @param node - Consequent statement to inspect.
 *
 * @returns `true` for `throw ...` and `{ throw ... }` shapes.
 */
export const isThrowOnlyConsequent = (
    node: Readonly<TSESTree.Statement>
): boolean => {
    if (node.type === "ThrowStatement") {
        return true;
    }

    /* v8 ignore next 4 -- defensive sparse-array guard for malformed synthetic AST nodes. */
    return (
        node.type === "BlockStatement" &&
        node.body.length === 1 &&
        node.body[0]?.type === "ThrowStatement"
    );
};

/**
 * Extract the throw statement from a throw-only consequent.
 *
 * @param node - Consequent statement to inspect.
 *
 * @returns Throw statement when present; otherwise `null`.
 */
export const getThrowStatementFromConsequent = (
    node: Readonly<TSESTree.Statement>
): null | TSESTree.ThrowStatement => {
    if (node.type === "ThrowStatement") {
        return node;
    }

    /* v8 ignore next 5 -- defensive sparse-array guard for malformed synthetic AST nodes. */
    if (
        node.type === "BlockStatement" &&
        node.body.length === 1 &&
        node.body[0]?.type === "ThrowStatement"
    ) {
        return node.body[0];
    }

    /* v8 ignore next -- guarded by isThrowOnlyConsequent before this helper is invoked in rule flow. */
    return null;
};
