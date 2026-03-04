/**
 * @packageDocumentation
 * Shared reporting helper for ts-extras array-method call replacement rules.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import {
    createMethodToFunctionCallFix,
    type ImportedValueAliasMap,
} from "./imported-value-symbols.js";
import { getIdentifierPropertyMemberCall } from "./member-call.js";
import { reportWithOptionalFix } from "./rule-reporting.js";

/** Typed rule context shape for array-method rule listeners. */
type ArrayMethodRuleContext = Readonly<
    TSESLint.RuleContext<string, Readonly<UnknownArray>>
>;

/** Direct named value imports collection type from shared import helper. */
type DirectNamedValueImports = ImportedValueAliasMap;

/**
 * Match `<arrayExpr>.<method>(...)` and report a standardized ts-extras helper
 * replacement when the receiver is array-like.
 */
export const reportTsExtrasArrayMethodCall = ({
    context,
    importedName,
    imports,
    isArrayLikeExpression,
    memberName,
    messageId,
    node,
}: Readonly<{
    context: ArrayMethodRuleContext;
    importedName: string;
    imports: DirectNamedValueImports;
    isArrayLikeExpression: (
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

    if (!isArrayLikeExpression(memberCall.callee.object)) {
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
