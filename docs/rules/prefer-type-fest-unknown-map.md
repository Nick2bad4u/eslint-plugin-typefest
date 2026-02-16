# Prefer TypeFest UnknownMap

Require TypeFest `UnknownMap` over `Map<unknown, unknown>`.

## What it checks

- `Map<unknown, unknown>` type references.

## Why

`UnknownMap` communicates intent more clearly and keeps unknown-container aliases consistent with other TypeFest-first conventions in this plugin.
