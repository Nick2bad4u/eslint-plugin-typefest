import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        exclude: ["test/fixtures/**", "docs/**"],
        fileParallelism: false,
        include: ["test/**/*.{test,spec}.ts"],
        maxWorkers: 1,
        minWorkers: 1,
        pool: "threads",
        testTimeout: 15_000,
    },
});
