# Prefer ts-extras objectHasIn

Require `objectHasIn()` from `ts-extras` over `Reflect.has()`.

## What it checks

- `Reflect.has(object, key)` calls.

## Why

`objectHasIn()` provides stronger TypeScript narrowing for key existence checks while preserving inherited-property semantics.
