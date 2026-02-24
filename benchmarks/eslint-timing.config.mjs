import {
    createTypefestFlatConfig,
    typefestRuleSets,
} from "./eslint-benchmark-config.mjs";

/**
 * Benchmark-oriented ESLint flat config for CLI TIMING/--stats runs.
 */
const benchmarkTimingConfig = createTypefestFlatConfig({
    rules: typefestRuleSets.recommended,
});

export default benchmarkTimingConfig;
