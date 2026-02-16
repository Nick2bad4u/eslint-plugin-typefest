# Prefer TypeFest UnknownSet

Require TypeFest `UnknownSet` over `ReadonlySet<unknown>`.

## What it checks

- `ReadonlySet<unknown>` type references.

## Why

`UnknownSet` provides a clearer shared alias for unknown-valued sets and keeps TypeFest utility usage consistent with other rules in this plugin.
