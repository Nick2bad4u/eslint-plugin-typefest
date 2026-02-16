# Prefer ts-extras assertPresent

Require `assertPresent()` from `ts-extras` over manual `== null` throw guards.

## What it checks

- `if (value == null) { throw ... }`

## Why

`assertPresent()` communicates nullish-assertion intent and provides a reusable narrowing helper.
