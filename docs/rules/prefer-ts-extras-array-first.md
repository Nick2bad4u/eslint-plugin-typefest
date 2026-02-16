# Prefer ts-extras arrayFirst

Require `arrayFirst()` from `ts-extras` over direct `array[0]` access.

## What it checks

- Array-like element access with index `0`, such as `values[0]`.

## Why

`arrayFirst()` provides stronger typing for tuples and readonly arrays, and it keeps first-element access consistent with other `ts-extras` helper rules in this plugin.
