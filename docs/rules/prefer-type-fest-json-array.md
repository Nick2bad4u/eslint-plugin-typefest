# Prefer TypeFest JsonArray

Require TypeFest `JsonArray` over explicit `JsonValue` array-union aliases.

## What it checks

- `JsonValue[] | readonly JsonValue[]`
- `Array<JsonValue> | ReadonlyArray<JsonValue>`

## Why

`JsonArray` communicates JSON array intent directly and avoids repeating equivalent array union shapes.
