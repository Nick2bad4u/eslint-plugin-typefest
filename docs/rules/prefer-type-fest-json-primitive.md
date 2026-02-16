# Prefer TypeFest JsonPrimitive

Require TypeFest `JsonPrimitive` over explicit JSON primitive keyword unions.

## What it checks

- `boolean | null | number | string` unions (in any order)

## Why

`JsonPrimitive` communicates JSON primitive intent directly and avoids repeating equivalent keyword-union definitions.
