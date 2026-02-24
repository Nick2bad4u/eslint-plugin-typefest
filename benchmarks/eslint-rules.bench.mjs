import { ESLint } from "eslint";
import { bench, describe } from "vitest";

import {
    benchmarkFileGlobs,
    createTypefestFlatConfig,
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
 *     rules: BenchmarkRules;
 * }>} LintScenarioOptions
 */

const singleRuleBenchmarks = Object.freeze({
    "typefest/prefer-ts-extras-is-present": "error",
    "typefest/prefer-type-fest-arrayable": "error",
});

const standardBenchmarkOptions = Object.freeze({
    iterations: 3,
    warmupIterations: 1,
});

const expensiveBenchmarkOptions = Object.freeze({
    iterations: 2,
    warmupIterations: 0,
});

/**
 * Count lint problems so benchmark runs assert useful signal.
 *
 * @param {LintResults} lintResults - ESLint lint results.
 *
 * @returns Total error + warning count.
 */
const countReportedProblems = (lintResults) =>
    lintResults.reduce(
        (problemCount, result) =>
            problemCount + result.errorCount + result.warningCount,
        0
    );

/**
 * Sum rule execution milliseconds from ESLint stats payload.
 *
 * @param {LintResults} lintResults - ESLint lint results.
 *
 * @returns Total rule timing in milliseconds.
 */
const sumRuleTimingMilliseconds = (lintResults) => {
    let totalRuleTime = 0;

    for (const result of lintResults) {
        const passes = result.stats?.times?.passes;
        if (!Array.isArray(passes)) {
            continue;
        }

        for (const pass of passes) {
            const passRules = pass?.rules;
            if (typeof passRules !== "object" || passRules === null) {
                continue;
            }

            for (const ruleTiming of Object.values(passRules)) {
                const measuredDuration =
                    typeof ruleTiming?.total === "number"
                        ? ruleTiming.total
                        : 0;
                totalRuleTime += measuredDuration;
            }
        }
    }

    return totalRuleTime;
};

/**
 * Guard benchmark outputs to ensure each case performs real lint work.
 *
 * @param {string} scenarioName - Human-friendly scenario label.
 * @param {LintResults} lintResults - ESLint lint results.
 */
const assertMeaningfulBenchmarkSignal = (scenarioName, lintResults) => {
    if (lintResults.length === 0) {
        throw new Error(`${scenarioName}: ESLint returned no lint results.`);
    }

    const reportedProblems = countReportedProblems(lintResults);
    if (reportedProblems < 1) {
        throw new Error(
            `${scenarioName}: expected at least one reported lint problem.`
        );
    }

    const measuredRuleTime = sumRuleTimingMilliseconds(lintResults);
    if (measuredRuleTime <= 0) {
        throw new Error(
            `${scenarioName}: expected positive ESLint rule timing.`
        );
    }
};

/**
 * Run ESLint with a temporary benchmark-specific config.
 *
 * @param {LintScenarioOptions} options - Scenario options.
 *
 * @returns {Promise<LintResult[]>} ESLint lint results.
 */
const lintScenario = async ({ filePatterns, fix, rules }) => {
    const eslint = new ESLint({
        cache: false,
        fix,
        overrideConfig: createTypefestFlatConfig({ rules }),
        overrideConfigFile: true,
        stats: true,
    });

    return eslint.lintFiles([...filePatterns]);
};

describe("eslint-plugin-typefest meaningful benchmarks", () => {
    bench(
        "recommended preset on full invalid typed fixture corpus",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.typedInvalidFixtures,
                fix: false,
                rules: typefestRuleSets.recommended,
            });

            assertMeaningfulBenchmarkSignal(
                "recommended preset on full invalid typed fixture corpus",
                lintResults
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "strict preset on full invalid typed fixture corpus",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.typedInvalidFixtures,
                fix: false,
                rules: typefestRuleSets.strict,
            });

            assertMeaningfulBenchmarkSignal(
                "strict preset on full invalid typed fixture corpus",
                lintResults
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "ts-extras type-guards preset on ts-extras invalid fixtures",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.tsExtrasInvalidFixtures,
                fix: false,
                rules: typefestRuleSets.tsExtrasTypeGuards,
            });

            assertMeaningfulBenchmarkSignal(
                "ts-extras type-guards preset on ts-extras invalid fixtures",
                lintResults
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "type-fest types preset on type-fest invalid fixtures",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.typeFestInvalidFixtures,
                fix: false,
                rules: typefestRuleSets.typeFestTypes,
            });

            assertMeaningfulBenchmarkSignal(
                "type-fest types preset on type-fest invalid fixtures",
                lintResults
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "recommended preset (fix=true) on ts-extras invalid fixtures",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.tsExtrasInvalidFixtures,
                fix: true,
                rules: typefestRuleSets.recommended,
            });

            assertMeaningfulBenchmarkSignal(
                "recommended preset (fix=true) on ts-extras invalid fixtures",
                lintResults
            );
        },
        expensiveBenchmarkOptions
    );

    bench(
        "single rule prefer-ts-extras-is-present on stress fixture",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.isPresentStressFixture,
                fix: false,
                rules: {
                    "typefest/prefer-ts-extras-is-present":
                        singleRuleBenchmarks[
                            "typefest/prefer-ts-extras-is-present"
                        ],
                },
            });

            assertMeaningfulBenchmarkSignal(
                "single rule prefer-ts-extras-is-present on stress fixture",
                lintResults
            );
        },
        standardBenchmarkOptions
    );

    bench(
        "single rule prefer-type-fest-arrayable on stress fixture",
        async () => {
            const lintResults = await lintScenario({
                filePatterns: benchmarkFileGlobs.arrayableStressFixture,
                fix: false,
                rules: {
                    "typefest/prefer-type-fest-arrayable":
                        singleRuleBenchmarks[
                            "typefest/prefer-type-fest-arrayable"
                        ],
                },
            });

            assertMeaningfulBenchmarkSignal(
                "single rule prefer-type-fest-arrayable on stress fixture",
                lintResults
            );
        },
        standardBenchmarkOptions
    );
});
