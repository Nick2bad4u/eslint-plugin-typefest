# Prefer TypeFest UnknownSet

Require TypeFest `UnknownSet` over `Set<unknown>`.

## What it checks

- `Set<unknown>` type references.

## Why

`UnknownSet` provides a clearer shared alias for unknown-valued sets and keeps TypeFest utility usage consistent with other rules in this plugin.
