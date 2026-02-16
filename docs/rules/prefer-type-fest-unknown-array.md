# Prefer TypeFest UnknownArray

Require TypeFest `UnknownArray` over `unknown[]` and `Array<unknown>`.

## What it checks

- `unknown[]`
- `Array<unknown>`

## Why

`UnknownArray` provides a clearer, shared alias for unknown element arrays and keeps utility-type usage consistent with other TypeFest-first conventions.
