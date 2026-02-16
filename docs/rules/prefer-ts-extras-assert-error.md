# Prefer ts-extras assertError

Require `assertError()` from `ts-extras` over manual `instanceof Error` throw guards.

## What it checks

- `if (!(value instanceof Error)) { throw ... }`

## Why

`assertError()` communicates error-assertion intent directly and centralizes assertion behavior.
