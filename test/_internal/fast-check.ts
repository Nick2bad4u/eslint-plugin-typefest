/**
 * @packageDocumentation
 * Shared fast-check run-count presets for test suites.
 */

type FastCheckRunConfig = Readonly<{
    numRuns: number;
}>;

type FastCheckRunCountKey =
    | "runs50"
    | "runs60"
    | "runs70"
    | "runs80"
    | "runs100";

type FastCheckRunCounts = Readonly<Record<FastCheckRunCountKey, number>>;

const defaultFastCheckNumRuns = 70 as const;

/**
 * Canonical run-count values used by property-based tests.
 *
 * All keys intentionally map to the same value so suites can keep their
 * historical key names while sharing one global run count.
 */
export const fastCheckRunCounts = {
    runs50: defaultFastCheckNumRuns,
    runs60: defaultFastCheckNumRuns,
    runs70: defaultFastCheckNumRuns,
    runs80: defaultFastCheckNumRuns,
    runs100: defaultFastCheckNumRuns,
} satisfies FastCheckRunCounts as FastCheckRunCounts;

/**
 * Prebuilt `fc.assert(..., options)` objects keyed by run-count tier.
 */
export const fastCheckRunConfig: Readonly<
    Record<keyof typeof fastCheckRunCounts, FastCheckRunConfig>
> = {
    runs50: {
        numRuns: fastCheckRunCounts.runs50,
    },
    runs60: {
        numRuns: fastCheckRunCounts.runs60,
    },
    runs70: {
        numRuns: fastCheckRunCounts.runs70,
    },
    runs80: {
        numRuns: fastCheckRunCounts.runs80,
    },
    runs100: {
        numRuns: fastCheckRunCounts.runs100,
    },
};
