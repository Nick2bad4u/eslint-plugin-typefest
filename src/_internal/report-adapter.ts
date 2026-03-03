/**
 * @packageDocumentation
 * Explicit report-adapter utilities for rule-level autofix policy handling.
 */
import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * Canonical report descriptor type for a given message/options pair.
 */
type ReportDescriptor<
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
> = Parameters<TSESLint.RuleContext<MessageIds, Options>["report"]>[0];

/**
 * Remove top-level autofix from a report descriptor while preserving all other
 * fields (including suggestions).
 */
export const omitAutofixFromReportDescriptor = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    descriptor: Readonly<ReportDescriptor<MessageIds, Options>>
): ReportDescriptor<MessageIds, Options> => {
    if (typeof descriptor !== "object" || descriptor === null) {
        return descriptor as ReportDescriptor<MessageIds, Options>;
    }

    if (!("fix" in descriptor)) {
        return descriptor as ReportDescriptor<MessageIds, Options>;
    }

    const ownFixDescriptor = Reflect.getOwnPropertyDescriptor(
        descriptor,
        "fix"
    );

    if (ownFixDescriptor === undefined) {
        return descriptor as ReportDescriptor<MessageIds, Options>;
    }

    if (
        "value" in ownFixDescriptor &&
        typeof ownFixDescriptor.value !== "function"
    ) {
        return descriptor as ReportDescriptor<MessageIds, Options>;
    }

    if (!("value" in ownFixDescriptor)) {
        return descriptor as ReportDescriptor<MessageIds, Options>;
    }

    const descriptorWithoutFix = {
        ...descriptor,
    };

    Reflect.deleteProperty(descriptorWithoutFix, "fix");

    return descriptorWithoutFix as ReportDescriptor<MessageIds, Options>;
};

/**
 * Build a report callback that enforces no-top-level-autofix semantics.
 */
export const createReportWithoutAutofixes =
    <MessageIds extends string, Options extends Readonly<UnknownArray>>(
        report: TSESLint.RuleContext<MessageIds, Options>["report"]
    ): TSESLint.RuleContext<MessageIds, Options>["report"] =>
    (descriptor) => {
        report(omitAutofixFromReportDescriptor(descriptor));
    };
