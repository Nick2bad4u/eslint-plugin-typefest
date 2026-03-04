/**
 * @packageDocumentation
 * Explicit report-adapter utilities for rule-level autofix policy handling.
 */
import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { isDefined } from "ts-extras";

/**
 * Contract for adapting a rule-context report callback.
 */
type ReportAdapter<
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
> = (
    report: ReportCallback<MessageIds, Options>
) => ReportCallback<MessageIds, Options>;

/**
 * Report callback type for a given message/options pair.
 */
type ReportCallback<
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
> = TSESLint.RuleContext<MessageIds, Options>["report"];

/**
 * Canonical report descriptor type for a given message/options pair.
 */
type ReportDescriptor<
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
> = Parameters<ReportCallback<MessageIds, Options>>[0];

/**
 * Determine whether a report descriptor has a callable own data-property `fix`
 * value that can be safely omitted.
 */
const hasCallableOwnFixDataProperty = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    descriptor: Readonly<ReportDescriptor<MessageIds, Options>>
): boolean => {
    const ownFixDescriptor = Object.getOwnPropertyDescriptor(descriptor, "fix");
    if (!isDefined(ownFixDescriptor)) {
        return false;
    }

    if (!Object.hasOwn(ownFixDescriptor, "value")) {
        return false;
    }

    return typeof ownFixDescriptor.value === "function";
};

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
    if (!hasCallableOwnFixDataProperty(descriptor)) {
        return descriptor;
    }

    const descriptorWithoutFix = {
        ...descriptor,
    };

    delete descriptorWithoutFix.fix;

    return descriptorWithoutFix;
};

/**
 * Build a report callback that enforces no-top-level-autofix semantics.
 */
export const createReportWithoutAutofixes =
    <MessageIds extends string, Options extends Readonly<UnknownArray>>(
        report: ReportCallback<MessageIds, Options>
    ): ReportCallback<MessageIds, Options> =>
    (descriptor) => {
        report(omitAutofixFromReportDescriptor(descriptor));
    };

/**
 * Create a RuleContext facade with an explicitly adapted `report` callback.
 *
 * @remarks
 * Uses a prototype facade instead of object spread so non-enumerable
 * RuleContext members (for example getter-backed `sourceCode`) remain
 * available.
 */
export const createRuleContextWithAdaptedReport = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
    reportAdapter: ReportAdapter<MessageIds, Options>
): TSESLint.RuleContext<MessageIds, Options> =>
    Object.create(context, {
        report: {
            configurable: true,
            enumerable: true,
            value: reportAdapter(context.report),
            writable: true,
        },
    });
