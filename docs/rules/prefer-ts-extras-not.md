# Prefer ts-extras not

Require `not()` from `ts-extras` over inline negated predicate callbacks in `filter` calls.

## What it checks

- `array.filter((value) => !predicate(value))`

## Why

`not(predicate)` communicates intent directly and preserves predicate-based typing in a reusable helper.
