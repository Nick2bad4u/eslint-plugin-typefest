# Prefer TypeFest UnknownArray

Require TypeFest `UnknownArray` over `readonly unknown[]` and `ReadonlyArray<unknown>`.

## What it checks

- `readonly unknown[]`
- `ReadonlyArray<unknown>`

## Why

`UnknownArray` provides a clearer, shared alias for unknown element arrays and keeps utility-type usage consistent with other TypeFest-first conventions.
