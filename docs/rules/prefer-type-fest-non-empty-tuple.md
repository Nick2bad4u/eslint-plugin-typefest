# Prefer TypeFest NonEmptyTuple

Require TypeFest `NonEmptyTuple` over the ad-hoc `readonly [T, ...T[]]` tuple pattern.

## What it checks

- `readonly [T, ...T[]]`

## Why

`NonEmptyTuple<T>` is a well-known TypeFest alias that communicates the intent of a non-empty tuple and keeps shared utility-type usage consistent across codebases.
