# ESLint Benchmark Suite

This directory contains **meaningful ESLint performance benchmarks** for `eslint-plugin-typefest`.

The suite intentionally measures three complementary workloads:

- **Real corpus benchmarks** against `test/fixtures/typed/*.invalid.ts` so rule timing reflects real rule inputs.
- **Preset-focused benchmarks** (`recommended`, `strict`, `ts-extras/type-guards`, `type-fest/types`) so regressions are attributable to a config surface.
- **Single-rule stress benchmarks** for focused hot-path investigation (`prefer-ts-extras-is-present`, `prefer-type-fest-arrayable`).

## Why this is meaningful

- Uses actual fixture corpora already maintained by rule tests.
- Uses typed linting (`parserOptions.project` with `tsconfig.eslint.json`) to include TypeScript checker overhead where applicable.
- Includes both **fix=false** and **fix=true** scenarios so autofix cost is visible.
- Captures ESLint timing data (`result.stats`) instead of relying only on wall-clock time.

## Run benchmarks

### Default benchmark runner

```bash
npm run bench
```

This runs `benchmarks/run-eslint-stats.mjs` with the default iteration/warmup settings and writes JSON to `coverage/benchmarks/eslint-stats.json`.

### ESLint stats summary runner

```bash
npm run bench:eslint:stats
```

Optional knobs:

```bash
node benchmarks/run-eslint-stats.mjs --iterations=5 --warmup=2
```

This writes scenario metrics and top-rule timing breakdowns to `coverage/benchmarks/eslint-stats.json`.

### Optional Vitest benchmark mode (experimental)

```bash
npm run bench:watch
```

This executes `benchmarks/**/*.bench.*` and writes benchmark JSON to `coverage/bench-results.json`.

### CLI TIMING + --stats (ESLint docs-aligned)

```bash
npm run bench:eslint:timing
```

This command enables `TIMING=all` and `--stats` to mirror ESLint's documented rule timing workflow.

## Interpreting results

- Use `recommended-invalid-corpus` as your baseline for day-to-day regressions.
- Use single-rule stress scenarios to isolate specific rule regressions before broad config runs.
- Compare `fix=false` vs `fix=true` to understand whether regressions come from detection or fixer generation.
