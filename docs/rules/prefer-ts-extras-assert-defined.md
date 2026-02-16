# Prefer ts-extras assertDefined

Require `assertDefined()` from `ts-extras` over manual undefined-guard throw blocks.

## What it checks

- `if (value === undefined) { throw ... }`
- `if (undefined === value) { throw ... }`

## Why

`assertDefined()` expresses the intent of narrowing away `undefined` and centralizes assertion behavior.
