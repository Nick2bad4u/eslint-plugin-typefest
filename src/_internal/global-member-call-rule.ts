/**
 * @packageDocumentation
 * Shared reporting helper for ts-extras global static member-call replacement
 * rules.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { getGlobalIdentifierMemberCall } from "./global-identifier-member-call.js";
import {
    createSafeValueReferenceReplacementFix,
    type ImportedValueAliasMap,
} from "./imported-value-symbols.js";
import { reportWithOptionalFix } from "./rule-reporting.js";

/** Direct named value imports collection type from shared import helper. */
type DirectNamedValueImports = ImportedValueAliasMap;

/** Typed rule context shape for global-member call rules. */
type GlobalMemberRuleContext = Readonly<
    TSESLint.RuleContext<string, Readonly<UnknownArray>>
>;

/**
 * Match `GlobalName.memberName(...)` calls that resolve to unshadowed globals
 * and report a standardized ts-extras replacement.
 */
export const reportTsExtrasGlobalMemberCall = ({
    context,
    importedName,
    imports,
    memberName,
    messageId,
    node,
    objectName,
}: Readonly<{
    context: GlobalMemberRuleContext;
    importedName: string;
    imports: DirectNamedValueImports;
    memberName: string;
    messageId: string;
    node: Readonly<TSESTree.CallExpression>;
    objectName: string;
}>): void => {
    const globalMemberCall = getGlobalIdentifierMemberCall({
        context,
        memberName,
        node,
        objectName,
    });

    if (globalMemberCall === null) {
        return;
    }

    reportWithOptionalFix({
        context,
        fix: createSafeValueReferenceReplacementFix({
            context,
            importedName,
            imports,
            sourceModuleName: "ts-extras",
            targetNode: globalMemberCall.callee,
        }),
        messageId,
        node,
    });
};
