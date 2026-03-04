/**
 * @packageDocumentation
 * Shared helpers for consistent rule reporting with optional fixes and
 * suggestion fallbacks.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * Resolution result for optional fix/suggestion reporting.
 */
export type AutofixOrSuggestionOutcome =
    | Readonly<{ fix: TSESLint.ReportFixFunction; kind: "autofix" }>
    | Readonly<{ fix: TSESLint.ReportFixFunction; kind: "suggestion" }>
    | Readonly<{ kind: "no-fix" }>;

/** Input shape for {@link resolveAutofixOrSuggestionOutcome}. */
type AutofixOrSuggestionResolutionInput = Readonly<{
    canAutofix: boolean;
    fix: null | TSESLint.ReportFixFunction;
}>;

/** Concrete report descriptor type for a rule context. */
type ReportDescriptor<
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
> = Parameters<TSESLint.RuleContext<MessageIds, Options>["report"]>[0];

/**
 * Report a diagnostic with an optional direct fix.
 *
 * @remarks
 * When `fix` is absent this reports only `messageId` + `node`.
 */
export const reportWithOptionalFix = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>({
    context,
    data,
    fix,
    messageId,
    node,
}: Readonly<{
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>;
    data?: ReportDescriptor<MessageIds, Options>["data"];
    fix: null | TSESLint.ReportFixFunction;
    messageId: MessageIds;
    node: TSESTree.Node;
}>): void => {
    const descriptor: ReportDescriptor<MessageIds, Options> = {
        ...(data === undefined ? {} : { data }),
        ...(fix === null ? {} : { fix }),
        messageId,
        node,
    };

    context.report(descriptor);
};

/**
 * Resolve one of three standardized reporting outcomes:
 *
 * - No fix (`messageId` only),
 * - Direct autofix (`fix`), or
 * - Suggestion-only (`suggest`).
 */
export function resolveAutofixOrSuggestionOutcome({
    canAutofix,
    fix,
}: AutofixOrSuggestionResolutionInput): AutofixOrSuggestionOutcome {
    if (fix === null) {
        return {
            kind: "no-fix",
        };
    }

    if (canAutofix) {
        return {
            fix,
            kind: "autofix",
        };
    }

    return {
        fix,
        kind: "suggestion",
    };
}
