// @ts-check

/** @type {import("@stryker-mutator/api/core").PartialStrykerOptions} */
const config = {
    allowConsoleColors: true,
    allowEmpty: false,
    checkers: ["typescript"],
    cleanTempDir: true,
    clearTextReporter: {
        allowColor: true,
        allowColors: true,
        allowEmojis: true,
        logTests: true,
        maxTestsToLog: 9999,
        reportMutants: true,
        reportScoreTable: true,
        reportTests: false,
        skipFull: false,
    },
    concurrency: 12,
    coverageAnalysis: "perTest",
    dashboard: {
        baseUrl: "https://dashboard.stryker-mutator.io",
        project: "github/nick2bad4u/eslint-plugin-typefest",
    },
    disableTypeChecks: false,
    htmlReporter: {
        fileName: "coverage/stryker.html",
    },
    // Fast default: static mutants are disproportionately expensive in this repository.
    // Use `npm run test:stryker:full` (or `test:stryker:full:ci`) for periodic full audits.
    ignoreStatic: false,
    incremental: true,
    incrementalFile: ".cache/stryker/incremental-full.json",
    jsonReporter: {
        fileName: "coverage/stryker.json",
    },
    maxTestRunnerReuse: 0,
    mutate: [
        "src/**/*.ts",
        "src/**/*.mjs",
        "src/**/*.js",
        "plugin.mjs",
        "!src/**/*.d.ts",
    ],
    packageManager: "npm",
    reporters: [
        "clear-text",
        "html",
        "json",
        "dashboard",
        "progress",
    ],
    symlinkNodeModules: true,
    testRunner: "vitest",
    thresholds: {
        break: 65,
        high: 85,
        low: 75,
    },
    timeoutFactor: 1.25,
    timeoutMS: 60_000,
    tsconfigFile: "tsconfig.build.json",
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
