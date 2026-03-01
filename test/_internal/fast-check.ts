/**
 * @packageDocumentation
 * Shared fast-check run configuration for property-based test suites.
 */

type FastCheckAssertConfiguration = Readonly<{
    numRuns: number;
}>;

const defaultFastCheckRunCount = 70 as const;

/**
 * Prebuilt `fc.assert(..., options)` objects.
 */
export const fastCheckRunConfig: Readonly<
    Record<"default", FastCheckAssertConfiguration>
> = {
    default: {
        numRuns: defaultFastCheckRunCount,
    },
};
