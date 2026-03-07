/**
 * @packageDocumentation
 * Canonical list of rule ids that require TypeScript program type information.
 */

/** Unqualified rule ids that require parserServices.program/type-checker access. */
export const typeCheckedRuleNames: ReadonlySet<`prefer-${string}`> = new Set([
    "prefer-ts-extras-array-at",
    "prefer-ts-extras-array-concat",
    "prefer-ts-extras-array-find",
    "prefer-ts-extras-array-find-last",
    "prefer-ts-extras-array-find-last-index",
    "prefer-ts-extras-array-first",
    "prefer-ts-extras-array-includes",
    "prefer-ts-extras-array-join",
    "prefer-ts-extras-array-last",
    "prefer-ts-extras-is-empty",
    "prefer-ts-extras-safe-cast-to",
    "prefer-ts-extras-set-has",
    "prefer-ts-extras-string-split",
]);

/** Typed rule ids included in the recommended-type-checked preset layer. */
export const recommendedTypeCheckedRuleNames: ReadonlySet<`prefer-${string}`> =
    new Set([
        "prefer-ts-extras-array-includes",
        "prefer-ts-extras-array-last",
        "prefer-ts-extras-is-empty",
        "prefer-ts-extras-safe-cast-to",
        "prefer-ts-extras-set-has",
    ]);

export default typeCheckedRuleNames;
