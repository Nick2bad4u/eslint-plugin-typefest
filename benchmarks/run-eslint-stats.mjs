import { ESLint } from "eslint";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
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
    if (!matchingArgument) {
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
 * Calculate arithmetic mean from numeric samples.
 *
 * @param {readonly number[]} values - Numeric samples.
 *
 * @returns {number} Mean value.
 */
const mean = (values) =>
    Math.sumPrecise(values) / values.length;

/**
 * Calculate median from numeric samples.
 *
 * @param {readonly number[]} values - Numeric samples.
 *
 * @returns {number} Median value.
 */
const median = (values) => {
    const sortedValues = [...values].sort((left, right) => left - right);
    const middleIndex = Math.floor(sortedValues.length / 2);

    if (sortedValues.length % 2 === 0) {
        return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
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
        const passes = lintResult.stats?.times?.passes;
        if (!Array.isArray(passes)) {
            continue;
        }

        for (const pass of passes) {
            parseMilliseconds +=
                typeof pass?.parse?.total === "number" ? pass.parse.total : 0;
            fixMilliseconds +=
                typeof pass?.fix?.total === "number" ? pass.fix.total : 0;

            const passRules = pass?.rules;
            if (typeof passRules !== "object" || passRules === null) {
                continue;
            }

            for (const ruleTiming of Object.values(passRules)) {
                ruleMilliseconds +=
                    typeof ruleTiming?.total === "number"
                        ? ruleTiming.total
                        : 0;
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
        const passes = lintResult.stats?.times?.passes;
        if (!Array.isArray(passes)) {
            continue;
        }

        for (const pass of passes) {
            const passRules = pass?.rules;
            if (typeof passRules !== "object" || passRules === null) {
                continue;
            }

            for (const [ruleName, ruleTiming] of Object.entries(passRules)) {
                const ruleTotal =
                    typeof ruleTiming?.total === "number"
                        ? ruleTiming.total
                        : 0;
                const previousTotal = ruleTotals.get(ruleName) ?? 0;
                ruleTotals.set(ruleName, previousTotal + ruleTotal);
            }
        }
    }

    return [...ruleTotals.entries()]
        .sort((left, right) => right[1] - left[1])
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
            if (referenceLintResults === null) {
                referenceLintResults = lintResults;
            }
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
