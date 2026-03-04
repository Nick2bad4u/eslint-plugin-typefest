/**
 * @packageDocumentation
 * Shared reporting helper for typed ts-extras identifier-member call rules.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import {
    createMethodToFunctionCallFix,
    type ImportedValueAliasMap,
} from "./imported-value-symbols.js";
import { getIdentifierPropertyMemberCall } from "./member-call.js";
import { reportWithOptionalFix } from "./rule-reporting.js";

/** Direct named value imports collection type from shared import helper. */
type DirectNamedValueImports = ImportedValueAliasMap;

/** Typed rule context shape for typed member-call rules. */
type TypedMemberCallRuleContext = Readonly<
    TSESLint.RuleContext<string, Readonly<UnknownArray>>
>;

/**
 * Match `<expr>.<memberName>(...)` and report a standardized ts-extras helper
 * replacement when the receiver expression satisfies a caller-provided type
 * predicate.
 */
export const reportTsExtrasTypedMemberCall = ({
    context,
    importedName,
    imports,
    isMatchingObjectExpression,
    memberName,
    messageId,
    node,
}: Readonly<{
    context: TypedMemberCallRuleContext;
    importedName: string;
    imports: DirectNamedValueImports;
    isMatchingObjectExpression: (
        expression: Readonly<TSESTree.Expression>
    ) => boolean;
    memberName: string;
    messageId: string;
    node: Readonly<TSESTree.CallExpression>;
}>): void => {
    const memberCall = getIdentifierPropertyMemberCall({
        memberName,
        node,
    });

    if (memberCall === null) {
        return;
    }

    if (!isMatchingObjectExpression(memberCall.callee.object)) {
        return;
    }

    reportWithOptionalFix({
        context,
        fix: createMethodToFunctionCallFix({
            callNode: node,
            context,
            importedName,
            imports,
            sourceModuleName: "ts-extras",
        }),
        messageId,
        node,
    });
};
