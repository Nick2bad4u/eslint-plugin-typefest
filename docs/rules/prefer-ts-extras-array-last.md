# Prefer ts-extras arrayLast

Require `arrayLast()` from `ts-extras` over direct `array[array.length - 1]` access.

## What it checks

- Array-like element access using `array[array.length - 1]`.

## Why

`arrayLast()` provides stronger typing for tuples and readonly arrays, and it keeps last-element access aligned with other `ts-extras` helper rules in this plugin.
