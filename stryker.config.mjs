// @ts-check
/** @type {import("@stryker-mutator/api/core").PartialStrykerOptions} */
const config = {
    allowConsoleColors: true,
    allowEmpty: false,
    checkers: ["typescript"],
    cleanTempDir: true,
    concurrency: 2,
    coverageAnalysis: "perTest",

    disableTypeChecks: false,
    htmlReporter: {
        fileName: "coverage/stryker.html",
    },
    // Fast default: static mutants are disproportionately expensive in this repository.
    // Use `npm run test:stryker:full` (or `test:stryker:full:ci`) for periodic full audits.
    ignoreStatic: false,
    incremental: true,
    incrementalFile: ".cache/stryker/incremental.json",
    jsonReporter: {
        fileName: "coverage/stryker.json",
    },
    maxTestRunnerReuse: 50,
    mutate: ["src/**/*.ts"],
    packageManager: "npm",
    reporters: [
        "clear-text",
        "html",
        "json",
        "progress",
    ],
    testRunner: "vitest",
    thresholds: {
        break: 60,
        high: 80,
        low: 70,
    },
    timeoutFactor: 1.5,
    timeoutMS: 120_000,
    tsconfigFile: "tsconfig.json",
    typescriptChecker: {
        prioritizePerformanceOverAccuracy: true,
    },
    vitest: {
        configFile: "./vitest.stryker.config.ts",
        related: false,
    },
    warnings: {
        preprocessorErrors: true,
        slow: true,
        unknownOptions: true,
        unserializableOptions: true,
    },
};

export default config;
