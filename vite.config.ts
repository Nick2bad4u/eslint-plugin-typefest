// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair -- project-wide disable pattern for build configs
/* eslint-disable n/no-process-env, comment-length/limit-single-line-comments   -- Disable specific rules for build configs */

import pc from "picocolors";
import {
    coverageConfigDefaults,
    defaultExclude,
    defineConfig,
} from "vitest/config";

const isCiEnvironment = process.env["CI"] === "true";
const configuredMaxWorkers =
    process.env["MAX_THREADS"] ?? (isCiEnvironment ? "1" : "8");
const parsedMaxWorkers = Number.parseInt(configuredMaxWorkers, 10);
const maxWorkerCount =
    Number.isFinite(parsedMaxWorkers) && parsedMaxWorkers > 0
        ? parsedMaxWorkers
        : 1;
const testExcludePatterns = [
    "**/.cache/**",
    "**/coverage/**",
    "**/dist/**",
    "**/node_modules/**",
];
const testFilePatterns = ["test/**/*.{test,spec}.{ts,tsx,js,mjs,cjs,mts,cts}"];

/**
 * Vitest configuration for eslint-plugin-typefest.
 */
export default defineConfig({
    cacheDir: "./.cache/vitest",
    test: {
        // Directory for storing Vitest test attachments (screenshots, logs, etc.) in a hidden cache folder.
        // This helps keep test artifacts organized and out of the main source tree.
        attachmentsDir: "./.cache/vitest/.vitest-attachments",
        // Stop after 200 failures to avoid excessive output
        bail: 200,
        benchmark: {
            exclude: [
                "**/dist*/**",
                "**/html/**",
                ...defaultExclude,
                "benchmarks/**/*.bench.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
            ],
            includeSamples: true,
            outputJson: "./coverage/bench-results.json",
            reporters: ["default", "verbose"],
        },
        chaiConfig: {
            includeStack: false,
            showDiff: true,
            truncateThreshold: 40,
        },
        coverage: {
            allowExternal: false,
            clean: true, // Clean coverage directory before each run
            cleanOnRerun: true, // Clean on rerun in watch mode
            exclude: [
                "**/*.bench.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}", // Exclude benchmark files,
                "**/*.config.*",
                "**/*.css", // CSS modules are transformed into JS stubs but contain no executable logic.
                "**/*.d.ts",
                "**/*.less",
                "**/*.sass",
                "**/*.scss",
                "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
                "**/assets/**", // Exclude any assets folder anywhere
                "**/config/**",
                "**/dist/**", // Exclude any dist folder anywhere
                "**/docs/**", // Exclude documentation files
                "**/html/**",
                "**/index.ts", // Exclude all barrel export files
                "**/index.tsx", // Exclude JSX barrel export files
                "**/node_modules/**",
                "**/playwright/**", // Exclude playwright directories anywhere
                "**/types.tsx", // Exclude type definition files with JSX
                "**/types/**",
                ".cache",
                ".cache/**",
                ".coverage",
                ".storybook/**",
                ".stryker-tmp/**", // Exclude Stryker mutation testing temp files
                "benchmarks/**", // Exclude all benchmark files from coverage
                "coverage/**",
                "electron/**", // Exclude all electron files from frontend coverage
                "html/**", // Exclude generated HTML files
                "index.ts", // Barrel export file at root
                "out",
                "playwright/**", // Exclude all playwright files from coverage
                "release/**",
                "report/**", // Exclude report files
                "reports/**", // Exclude test report files
                "scripts/**",
                "shared",
                "shared/test",
                "src/**/baseTypes.ts", // Exclude interface-only files that contain only TypeScript interfaces
                "src/**/types.ts", // Exclude type definition files only in src directory
                "src/test/**",
                "storybook-static/**",
                "storybook/**",
                "stryker_prompts_by_mutator/**",
                "temp",
                "temp/**",
                ...coverageConfigDefaults.exclude,
            ],
            excludeAfterRemap: true, // Exclude files after remapping for accuracy
            include: ["plugin.mjs", "src/**/*.ts"],
            // V8 Provider Configuration (Recommended since Vitest v3.2.0)
            provider: "v8" as const, // Switch to V8 for better TypeScript support
            reporter: [
                "text",
                "json",
                "lcov",
                "html",
            ],

            reportOnFailure: true,
            reportsDirectory: "./coverage",
            skipFull: false, // Don't skip full coverage collection
            // NOTE: Coverage thresholds adjusted after empirical analysis of current
            // instrumentation (November 2025). JSX-heavy components and patched CSS
            // modules generate synthetic branches that Vitest counts but cannot be
            // exercised in runtime. The revised values enforce strong coverage for
            // executable logic without blocking on non-actionable gaps.
            thresholds: {
                // Auto-update requires Vitest to rewrite the originating config file.
                // Our configuration is generated dynamically via defineConfig callbacks,
                // which Magicast cannot safely mutate, so we keep this disabled to
                // avoid runtime parse failures during coverage reporting.
                autoUpdate: false,
                branches: 50, // Tightened to reflect real-world branch coverage considering JSX/CSS-module instrumentation (see analysis)
                functions: 50,
                lines: 50,
                statements: 50,
            },
        },
        css: false,
        dangerouslyIgnoreUnhandledErrors: false,
        deps: {
            optimizer: {
                web: { enabled: false },
            },
        },
        diff: {
            aIndicator: pc.magenta(pc.bold("--")), // Magenta is much more readable than red
            bIndicator: pc.green(pc.bold("++")), // Clean single-character indicators
            expand: true,
            // The value 20 for maxDepth was chosen to provide sufficient context for deeply nested object diffs.
            // This helps debugging complex test failures, but may impact performance for very large or deeply nested objects.
            // Monitor test performance and adjust this value if you encounter slowdowns with large diffs.
            maxDepth: 20,
            omitAnnotationLines: true,
            printBasicPrototype: false,
            truncateAnnotation: pc.yellow(
                pc.bold("... Diff output truncated for readability")
            ), // Yellow is more eye-catching than cyan
            // The value 250 for truncateThreshold was selected to balance readability and performance.
            // It limits the maximum number of diff lines shown, preventing excessively long outputs
            // while still providing enough context for most test failures. Increasing this value may
            // slow down output and clutter logs; decreasing it could hide important diff details.
            truncateThreshold: 250,
        },
        env: {
            NODE_ENV: "test",

            PACKAGE_VERSION: process.env["PACKAGE_VERSION"] ?? "unknown",
        },
        environment: "node",
        // Test file patterns - exclude electron tests as they have their own config
        exclude: [
            "**/coverage/**",
            "**/dist/**",
            "**/docs/**",
            "**/node_modules/**",
            ...testExcludePatterns,
            ...defaultExclude,
        ],
        expect: {
            poll: { interval: 50, timeout: 15_000 },
            // RuleTester-driven suites validate via ESLint internals rather than
            // direct Vitest `expect(...)` calls, so enabling this globally causes
            // false failures (`expected any number of assertion, but got none`).
            requireAssertions: false,
        },
        fakeTimers: {
            advanceTimeDelta: 20,
            loopLimit: 10_000,
            now: Date.now(),
            shouldAdvanceTime: false,
            shouldClearNativeTimers: true,
        },
        // Always run test files in parallel locally for speed.
        // CI disables file-level parallelism for deterministic resource usage.
        fileParallelism: !isCiEnvironment,
        globals: true,
        include: [...testFilePatterns],
        includeTaskLocation: true,
        isolate: true,
        logHeapUsage: true,
        // NOTE: Vitest v4 removed `test.poolOptions`. Use `maxWorkers` instead.
        // On Windows, keeping this bounded avoids worker starvation/timeouts.
        maxWorkers: maxWorkerCount,
        name: {
            color: "cyan",
            label: "Test", // Simplified label to match vitest.config.ts
        }, // Custom project name and color for Vitest
        outputFile: {
            json: "./coverage/test-results.json",
        },
        pool: "threads", // Use worker threads for better performance
        printConsoleTrace: false, // Disable stack trace printing for cleaner output
        // Improve test output
        reporters: [
            "default",
            // "json",
            // "verbose",
            "hanging-process",
            // "dot",
            // "tap",
            // "tap-flat",
            // "junit",
            // "html",
        ],
        retry: 0, // No retries to surface issues immediately
        sequence: {
            // Run projects sequentially to avoid resource contention
            concurrent: false,
            groupOrder: 0,
            setupFiles: "parallel",
        },
        slowTestThreshold: 300,
        testTimeout: 15_000, // Set Vitest timeout to 15 seconds
        typecheck: {
            allowJs: false,
            checker: "tsc",
            enabled: true,
            exclude: [
                "**/.{idea,git,cache,output,temp}/**",
                "**/dist*/**",
                "**/html/**",
                ...defaultExclude,
            ],
            ignoreSourceErrors: false,
            include: ["**/*.{test,spec}-d.?(c|m)[jt]s?(x)"],
            only: false,
            spawnTimeout: 10_000,
            tsconfig: "./tsconfig.json",
        },
    },
});
