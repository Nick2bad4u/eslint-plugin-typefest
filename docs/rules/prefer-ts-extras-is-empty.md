# Prefer ts-extras isEmpty

Require `isEmpty()` from `ts-extras` over direct `array.length === 0` checks.

## What it checks

- `array.length === 0`
- `0 === array.length`

## Why

`isEmpty()` is a dedicated emptiness predicate and keeps collection checks aligned with the rest of the `ts-extras` helper ecosystem used by this plugin.
