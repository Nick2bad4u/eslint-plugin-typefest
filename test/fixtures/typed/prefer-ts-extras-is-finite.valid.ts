declare function isFinite(value: unknown): value is number;

const firstMetric: unknown = Math.random() > 0.5 ? 1 : Number.NaN;
const secondMetric: unknown =
    Math.random() > 0.5 ? 2 : Number.POSITIVE_INFINITY;

if (isFinite(firstMetric) && isFinite(secondMetric)) {
    const totalMetric = firstMetric + secondMetric;
    if (totalMetric > 1000) {
        throw new TypeError("Unexpectedly large metric sum");
    }
}

export const typedFixtureModule = "typed-fixture-module";
