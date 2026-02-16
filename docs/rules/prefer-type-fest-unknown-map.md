# Prefer TypeFest UnknownMap

Require TypeFest `UnknownMap` over `ReadonlyMap<unknown, unknown>`.

## What it checks

- `ReadonlyMap<unknown, unknown>` type references.

## Why

`UnknownMap` communicates intent directly and keeps unknown-container aliases consistent with other TypeFest-first conventions in this plugin.
