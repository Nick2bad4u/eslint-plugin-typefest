import { ESLint } from "eslint";
import { mkdir, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { performance } from "node:perf_hooks";

import {
    benchmarkFileGlobs,
    createTypefestFlatConfig,
    repositoryRoot,
    typefestRuleSets,
} from "./eslint-benchmark-config.mjs";

/**
 * @typedef {import("eslint").ESLint.LintResult} LintResult
 */

/**
 * @typedef {ReadonlyArray<LintResult>} LintResults
 */

/**
 * @typedef {Record<string, unknown>} BenchmarkRules
 */

/**
 * @typedef {Readonly<{
 *     filePatterns: readonly string[];
 *     fix: boolean;
 *     name: string;
 *     rules: BenchmarkRules;
 * }>} BenchmarkScenario
 */

/**
 * @typedef {Readonly<{
 *     filePatterns: readonly string[];
 *     fix: boolean;
 *     iterations: number;
 *     name: string;
 *     rules: BenchmarkRules;
 *     warmupIterations: number;
 * }>} RunScenarioOptions
 */

/**
 * @typedef {{ ruleName: string; totalMilliseconds: number }} RuleTiming
 */

/**
 * @typedef {{
 *     fixMilliseconds: number;
 *     parseMilliseconds: number;
 *     ruleMilliseconds: number;
 * }} TimingBreakdown
 */

/**
 * @typedef {{
 *     filePatterns: string[];
 *     fix: boolean;
 *     fixMilliseconds: number;
 *     iterations: number;
 *     messageCount: number;
 *     name: string;
 *     parseMilliseconds: number;
 *     ruleMilliseconds: number;
 *     topRules: RuleTiming[];
 *     wallClock: {
 *         maxMilliseconds: number;
 *         meanMilliseconds: number;
 *         medianMilliseconds: number;
 *         minMilliseconds: number;
 *     };
 *     warmupIterations: number;
 * }} ScenarioResult
 */

const defaultIterations = 3;
const defaultWarmupIterations = 1;

/** @type {readonly BenchmarkScenario[]} */
const benchmarkScenarios = Object.freeze([
    {
        filePatterns: benchmarkFileGlobs.typedInvalidFixtures,
        fix: false,
        name: "recommended-invalid-corpus",
        rules: typefestRuleSets.recommended,
    },
    {
        filePatterns: benchmarkFileGlobs.typedInvalidFixtures,
        fix: false,
        name: "strict-invalid-corpus",
        rules: typefestRuleSets.strict,
    },
    {
        filePatterns: benchmarkFileGlobs.tsExtrasInvalidFixtures,
        fix: false,
        name: "ts-extras-type-guards-invalid-corpus",
        rules: typefestRuleSets.tsExtrasTypeGuards,
    },
    {
        filePatterns: benchmarkFileGlobs.typeFestInvalidFixtures,
        fix: false,
        name: "type-fest-types-invalid-corpus",
        rules: typefestRuleSets.typeFestTypes,
    },
    {
        filePatterns: benchmarkFileGlobs.tsExtrasInvalidFixtures,
        fix: true,
        name: "recommended-fix-on-ts-extras-invalid-corpus",
        rules: typefestRuleSets.recommended,
    },
]);

/**
 * Parse an integer argument in `--key=value` form.
 *
 * @param {string} key - CLI key without the leading dashes.
 * @param {number} fallbackValue - Value used when key is not provided.
 *
 * @returns {number} Parsed positive integer.
 */
const parseIntegerArgument = (key, fallbackValue) => {
    const matchingArgument = process.argv.find((argument) =>
        argument.startsWith(`--${key}=`)
    );
    if (matchingArgument === undefined) {
        return fallbackValue;
    }

    const [, rawValue = ""] = matchingArgument.split("=");
    const parsedValue = Number.parseInt(rawValue, 10);
    if (!Number.isInteger(parsedValue) || parsedValue < 0) {
        throw new TypeError(
            `Expected --${key}=<non-negative-integer>; received '${rawValue}'.`
        );
    }

    return parsedValue;
};

/**
 * Build an ESLint instance for benchmark scenarios.
 *
 * @param {{ fix: boolean; rules: BenchmarkRules }} options - ESLint benchmark
 *   options.
 *
 * @returns {ESLint} Configured ESLint instance.
 */
const createBenchmarkEslint = ({ fix, rules }) =>
    new ESLint({
        cache: false,
        fix,
        overrideConfig: createTypefestFlatConfig({ rules }),
        overrideConfigFile: true,
        stats: true,
    });

/**
 * Narrow unknown values to object records.
 *
 * @param {unknown} value - Value to inspect.
 *
 * @returns {value is Record<string, unknown>} Whether value is object-like.
 */
const isObjectRecord = (value) => typeof value === "object" && value !== null;

/**
 * Extract lint passes from ESLint result stats.
 *
 * @param {LintResult} lintResult - ESLint lint result.
 *
 * @returns {readonly unknown[]} ESLint pass payloads.
 */
const getLintPasses = (lintResult) => {
    const stats = lintResult.stats;
    if (!isObjectRecord(stats)) {
        return [];
    }

    const times = stats.times;
    if (!isObjectRecord(times)) {
        return [];
    }

    const passes = times.passes;
    return Array.isArray(passes) ? passes : [];
};

/**
 * Normalize timing payloads to milliseconds.
 *
 * @param {unknown} timingPayload - Arbitrary timing payload.
 *
 * @returns {number} Timing total in milliseconds.
 */
const getTimingTotalMilliseconds = (timingPayload) => {
    if (!isObjectRecord(timingPayload)) {
        return 0;
    }

    const total = timingPayload["total"];
    return typeof total === "number" ? total : 0;
};

/**
 * Extract a phase timing (`parse`, `fix`) from a lint pass.
 *
 * @param {unknown} pass - ESLint pass payload.
 * @param {"fix" | "parse"} phaseName - Pass phase field name.
 *
 * @returns {number} Phase timing in milliseconds.
 */
const getPassPhaseTimingMilliseconds = (pass, phaseName) => {
    if (!isObjectRecord(pass)) {
        return 0;
    }

    return getTimingTotalMilliseconds(pass[phaseName]);
};

/**
 * Extract pass rule timing record.
 *
 * @param {unknown} pass - ESLint pass payload.
 *
 * @returns {null | Record<string, unknown>} Rule timing map when available.
 */
const getPassRules = (pass) => {
    if (!isObjectRecord(pass)) {
        return null;
    }

    const rules = pass.rules;
    return isObjectRecord(rules) ? rules : null;
};

/**
 * Sum numeric samples.
 */
const runtimeMath =
    /** @type {Math & { sumPrecise: (items: Iterable<number>) => number }} */ (
        Math
    );

/**
 * Sum numeric samples.
 *
 * @param {readonly number[]} values - Numeric samples.
 *
 * @returns {number} Sum of all values.
 */
const sum = (values) => {
    if (values.length === 0) {
        return 0;
    }

    return runtimeMath.sumPrecise(values);
};

/**
 * Safely divide two numbers and return `undefined` when denominator is zero.
 *
 * @param {number} numerator - Numerator.
 * @param {number} denominator - Denominator.
 *
 * @returns {number | undefined} Quotient when denominator is non-zero.
 */
const divide = (numerator, denominator) =>
    // eslint-disable-next-line total-functions/no-partial-division -- Guard above guarantees denominator is non-zero on this branch.
    denominator === 0 ? undefined : numerator / denominator;

/**
 * Sort values without mutating native prototype methods like `.sort()`.
 *
 * @template T
 *
 * @param {readonly T[]} values - Values to sort.
 * @param {(left: T, right: T) => number} compare - Comparator callback.
 *
 * @returns {T[]} New sorted array.
 */
const sortValues = (values, compare) => {
    const sortedValues = [...values];

    for (
        let currentIndex = 1;
        currentIndex < sortedValues.length;
        currentIndex += 1
    ) {
        const currentValue = sortedValues[currentIndex];
        let scanIndex = currentIndex - 1;

        while (
            scanIndex >= 0 &&
            compare(sortedValues[scanIndex], currentValue) > 0
        ) {
            sortedValues[scanIndex + 1] = sortedValues[scanIndex];
            scanIndex -= 1;
        }

        sortedValues[scanIndex + 1] = currentValue;
    }

    return sortedValues;
};

/**
 * Accumulate a single rule timing into a totals map.
 *
 * @param {Map<string, number>} ruleTotals - Existing totals map.
 * @param {string} ruleName - Rule identifier.
 * @param {number} ruleTotal - Rule timing to add.
 */
const addRuleTiming = (ruleTotals, ruleName, ruleTotal) => {
    const currentTotal = ruleTotals.get(ruleName) ?? 0;
    ruleTotals.set(ruleName, currentTotal + ruleTotal);
};

/**
 * Calculate arithmetic mean from numeric samples.
 *
 * @param {readonly number[]} values - Numeric samples.
 *
 * @returns {number} Mean value.
 */
const mean = (values) => divide(sum(values), values.length) ?? 0;

/**
 * Calculate median from numeric samples.
 *
 * @param {readonly number[]} values - Numeric samples.
 *
 * @returns {number} Median value.
 */
const median = (values) => {
    if (values.length === 0) {
        return 0;
    }

    const sortedValues = sortValues(values, (left, right) => left - right);
    const middleIndex = Math.floor(sortedValues.length / 2);

    if (sortedValues.length % 2 === 0) {
        return (
            (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) * 0.5
        );
    }

    return sortedValues[middleIndex];
};

/**
 * Aggregate ESLint parse/rule/fix timing from stats payload.
 *
 * @param {LintResults} lintResults - ESLint lint results.
 *
 * @returns {TimingBreakdown} Timing breakdown in milliseconds.
 */
const aggregateTimingBreakdown = (lintResults) => {
    let fixMilliseconds = 0;
    let parseMilliseconds = 0;
    let ruleMilliseconds = 0;

    for (const lintResult of lintResults) {
        for (const pass of getLintPasses(lintResult)) {
            parseMilliseconds += getPassPhaseTimingMilliseconds(pass, "parse");
            fixMilliseconds += getPassPhaseTimingMilliseconds(pass, "fix");

            const passRules = getPassRules(pass);
            if (passRules !== null) {
                for (const ruleTiming of Object.values(passRules)) {
                    ruleMilliseconds += getTimingTotalMilliseconds(ruleTiming);
                }
            }
        }
    }

    return {
        fixMilliseconds,
        parseMilliseconds,
        ruleMilliseconds,
    };
};

/**
 * Collect top rules by timing from lint results.
 *
 * @param {LintResults} lintResults - ESLint lint results.
 * @param {number} [topCount=8] - Maximum rule entries to return. Default is `8`
 *
 * @returns {RuleTiming[]} Sorted top rule timings.
 */
const collectTopRuleTimings = (lintResults, topCount = 8) => {
    /** @type {Map<string, number>} */
    const ruleTotals = new Map();

    for (const lintResult of lintResults) {
        for (const pass of getLintPasses(lintResult)) {
            const passRules = getPassRules(pass);
            if (passRules !== null) {
                for (const [ruleName, ruleTiming] of Object.entries(
                    passRules
                )) {
                    const ruleTotal = getTimingTotalMilliseconds(ruleTiming);
                    addRuleTiming(ruleTotals, ruleName, ruleTotal);
                }
            }
        }
    }

    return sortValues(
        [...ruleTotals.entries()],
        (left, right) => right[1] - left[1]
    )
        .slice(0, topCount)
        .map(([ruleName, totalMilliseconds]) => ({
            ruleName,
            totalMilliseconds,
        }));
};

/**
 * Count total lint messages across results.
 *
 * @param {LintResults} lintResults - ESLint lint results.
 *
 * @returns {number} Total lint messages.
 */
const countMessages = (lintResults) =>
    lintResults.reduce(
        (messageCount, lintResult) =>
            messageCount + lintResult.errorCount + lintResult.warningCount,
        0
    );

/**
 * Execute a benchmark scenario with warmup and measured iterations.
 *
 * @param {RunScenarioOptions} options - Scenario execution options.
 *
 * @returns {Promise<ScenarioResult>} Aggregated scenario result.
 */
const runScenario = async ({
    filePatterns,
    fix,
    iterations,
    name,
    rules,
    warmupIterations,
}) => {
    /** @type {number[]} */
    const measuredDurations = [];
    /** @type {LintResult[] | null} */
    let referenceLintResults = null;

    for (
        let iteration = 0;
        iteration < iterations + warmupIterations;
        iteration += 1
    ) {
        const eslint = createBenchmarkEslint({ fix, rules });
        const startedAt = performance.now();
        const lintResults = await eslint.lintFiles([...filePatterns]);
        const elapsedMilliseconds = performance.now() - startedAt;

        if (iteration >= warmupIterations) {
            measuredDurations.push(elapsedMilliseconds);
            referenceLintResults ??= lintResults;
        }
    }

    if (referenceLintResults === null) {
        throw new Error(`${name}: no measured lint results were captured.`);
    }

    const messageCount = countMessages(referenceLintResults);
    if (messageCount < 1) {
        throw new Error(`${name}: expected at least one lint message.`);
    }

    const timingBreakdown = aggregateTimingBreakdown(referenceLintResults);
    const topRules = collectTopRuleTimings(referenceLintResults);

    return {
        filePatterns: [...filePatterns],
        fix,
        iterations,
        messageCount,
        name,
        topRules,
        wallClock: {
            maxMilliseconds: Math.max(...measuredDurations),
            meanMilliseconds: mean(measuredDurations),
            medianMilliseconds: median(measuredDurations),
            minMilliseconds: Math.min(...measuredDurations),
        },
        warmupIterations,
        ...timingBreakdown,
    };
};

const iterations = parseIntegerArgument("iterations", defaultIterations);
const warmupIterations = parseIntegerArgument(
    "warmup",
    defaultWarmupIterations
);

if (iterations === 0) {
    throw new TypeError("--iterations must be at least 1.");
}

/** @type {ScenarioResult[]} */
const scenarioResults = [];
for (const scenario of benchmarkScenarios) {
    const result = await runScenario({
        ...scenario,
        iterations,
        warmupIterations,
    });
    scenarioResults.push(result);
}

const summaryRows = scenarioResults.map((scenarioResult) => ({
    fixMs: Number(scenarioResult.fixMilliseconds.toFixed(2)),
    meanMs: Number(scenarioResult.wallClock.meanMilliseconds.toFixed(2)),
    medianMs: Number(scenarioResult.wallClock.medianMilliseconds.toFixed(2)),
    messages: scenarioResult.messageCount,
    parseMs: Number(scenarioResult.parseMilliseconds.toFixed(2)),
    rulesMs: Number(scenarioResult.ruleMilliseconds.toFixed(2)),
    scenario: scenarioResult.name,
}));

console.table(summaryRows);
for (const scenarioResult of scenarioResults) {
    console.log(`\nTop rules by timing for '${scenarioResult.name}':`);
    console.table(
        scenarioResult.topRules.map((entry) => ({
            rule: entry.ruleName,
            totalMs: Number(entry.totalMilliseconds.toFixed(2)),
        }))
    );
}

const outputDirectory = path.join(repositoryRoot, "coverage", "benchmarks");
const outputPath = path.join(outputDirectory, "eslint-stats.json");
await mkdir(outputDirectory, { recursive: true });
await writeFile(
    outputPath,
    `${JSON.stringify(
        {
            generatedAt: new Date().toISOString(),
            iterations,
            scenarios: scenarioResults,
            warmupIterations,
        },
        null,
        2
    )}\n`,
    "utf8"
);

console.log(`\nWrote benchmark stats to ${outputPath}`);
