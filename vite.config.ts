import { defineConfig } from "vitest/config";

const testExcludePatterns = [
        "**/.cache/**",
        "**/coverage/**",
        "**/dist/**",
        "**/node_modules/**",
    ],
    testFilePatterns = [
        "test/**/*.{test,spec}.{ts,tsx,js,mjs,cjs,mts,cts}",
    ];

/**
 * Vitest configuration for eslint-plugin-typefest.
 */
export default defineConfig({
    cacheDir: "./.cache/vitest",
    test: {
        environment: "node",
        exclude: testExcludePatterns,
        fileParallelism: false,
        globals: true,
        include: testFilePatterns,
        logHeapUsage: true,
        typecheck: {
            checker: "tsc",
            enabled: false,
            tsconfig: "tsconfig.json",
        },
    },
});
