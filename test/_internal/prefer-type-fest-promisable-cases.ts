/**
 * @packageDocumentation
 * Shared code fixtures for `prefer-type-fest-promisable` tests.
 */

export const validFixtureName: string = "prefer-type-fest-promisable.valid.ts";
export const invalidFixtureName: string =
    "prefer-type-fest-promisable.invalid.ts";

const replaceOrThrow = ({
    replacement,
    sourceText,
    target,
}: Readonly<{
    replacement: string;
    sourceText: string;
    target: string;
}>): string => {
    const replacedText = sourceText.replace(target, replacement);

    if (replacedText === sourceText) {
        throw new TypeError(
            `Expected prefer-type-fest-promisable fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

export const inlineFixableInvalidCode: string = [
    'import type { MaybePromise } from "type-aliases";',
    'import type { Promisable } from "type-fest";',
    "",
    "type JobResult = MaybePromise<string>;",
].join("\n");

export const inlineFixableOutputCode: string = replaceOrThrow({
    replacement: "type JobResult = Promisable<string>;",
    sourceText: inlineFixableInvalidCode,
    target: "type JobResult = MaybePromise<string>;",
});

export const inlineInvalidWithoutFixCode: string = [
    'import type { MaybePromise } from "type-aliases";',
    "",
    "type JobResult = MaybePromise<string>;",
].join("\n");

export const inlineInvalidWithoutFixOutputCode: string = [
    'import type { MaybePromise } from "type-aliases";',
    'import type { Promisable } from "type-fest";',
    "",
    "type JobResult = Promisable<string>;",
].join("\n");

export const promiseFirstInvalidCode: string =
    "type Result = Promise<string> | string;";
export const promiseSecondInvalidCode: string =
    "type Result = string | Promise<string>;";
export const promiseLikeValidCode: string =
    "type Result = PromiseLike<string> | string;";
export const promiseNoTypeArgumentsValidCode: string =
    "type Result = Promise | string;";
export const promiseNullValidCode: string =
    "type Result = Promise<string> | null;";
export const promiseUndefinedUnionValidCode: string =
    "type Result = Promise<string> | undefined;";
export const promiseUndefinedValidCode: string =
    "type Result = PromiseLike<string> | undefined;";
export const promiseNeverValidCode: string =
    "type Result = Promise<string> | never;";
export const promiseNullInnerMatchValidCode: string =
    "type Result = Promise<null> | null;";
export const promiseUndefinedInnerMatchValidCode: string =
    "type Result = Promise<undefined> | undefined;";
export const promiseNeverInnerMatchValidCode: string =
    "type Result = Promise<never> | never;";
export const doublePromiseUnionValidCode: string =
    "type Result = Promise<string> | Promise<string>;";
export const promiseMismatchValidCode: string =
    "type Result = Promise<string> | number;";
export const promiseThreeMemberUnionValidCode: string =
    "type Result = Promise<string> | number | string;";
export const promiseThreeMemberLeadingPairValidCode: string =
    "type Result = Promise<string> | string | boolean;";
export const promiseThreeMemberLeadingReversePairValidCode: string =
    "type Result = string | Promise<string> | boolean;";
export const promiseFourMemberLeadingPairValidCode: string =
    "type Result = Promise<string> | string | boolean | number;";
export const promiseFourMemberLeadingReversePairValidCode: string =
    "type Result = string | Promise<string> | boolean | number;";
export const nullFirstPromiseSecondValidCode: string =
    "type Result = null | Promise<string>;";
export const undefinedFirstPromiseSecondValidCode: string =
    "type Result = undefined | Promise<string>;";
export const neverFirstPromiseSecondValidCode: string =
    "type Result = never | Promise<string>;";

export const alreadyPromisableUnionValidCode: string = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promise<string> | Promisable<string>;",
].join("\n");

export const nestedPromisableUnionValidCode: string = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promise<Promisable<string>> | Promisable<string>;",
].join("\n");

export const reverseNestedPromisableUnionValidCode: string = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promisable<string> | Promise<Promisable<string>>;",
].join("\n");

export const threeMemberPromisableUnionValidCode: string = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promise<Promisable<string>> | Promisable<string> | boolean;",
].join("\n");

export const qualifiedPromiseValidCode: string =
    "type Result = globalThis.Promise<string> | string;";

export const customWrapperValidCode: string = [
    "type MaybePromise<T> = Promise<T>;",
    "type Result = MaybePromise<string> | string;",
].join("\n");
