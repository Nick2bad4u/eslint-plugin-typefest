import type { UnknownArray } from "type-fest";

import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * Shared helpers for validating canonical `throw new TypeError(...)` shapes.
 */
import { isGlobalIdentifierNamed } from "./typed-rule.js";

/**
 * Extract the single constructor argument from `throw new TypeError(...)`
 * statements when the constructor resolves to the global `TypeError` binding.
 *
 * @param options - Rule context and throw statement candidate.
 *
 * @returns The single non-spread constructor argument; otherwise `null`.
 */
export const getSingleGlobalTypeErrorArgument = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>({
    context,
    throwStatement,
}: Readonly<{
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>;
    throwStatement: Readonly<TSESTree.ThrowStatement>;
}>): null | TSESTree.Expression => {
    if (
        throwStatement.argument.type !== AST_NODE_TYPES.NewExpression ||
        throwStatement.argument.callee.type !== AST_NODE_TYPES.Identifier ||
        throwStatement.argument.callee.name !== "TypeError" ||
        !isGlobalIdentifierNamed(
            context,
            throwStatement.argument.callee,
            "TypeError"
        ) ||
        throwStatement.argument.arguments.length !== 1
    ) {
        return null;
    }

    const [firstArgument] = throwStatement.argument.arguments;
    if (!firstArgument || firstArgument.type === AST_NODE_TYPES.SpreadElement) {
        return null;
    }

    return firstArgument;
};
