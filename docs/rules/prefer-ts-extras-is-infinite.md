# Prefer ts-extras isInfinite

Require `isInfinite()` from `ts-extras` over direct Infinity equality checks.

## What it checks

- `value === Infinity`
- `value === Number.POSITIVE_INFINITY`
- `value === Number.NEGATIVE_INFINITY`

## Why

`isInfinite()` keeps runtime predicate usage consistent with other `ts-extras` numeric guards and expresses intent directly instead of relying on raw constant comparisons.
