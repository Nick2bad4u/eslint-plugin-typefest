# Prefer TypeFest Except

Require TypeFest `Except<T, K>` over `Omit<T, K>` when removing keys from object types.

## What it checks

- Type references shaped like `Omit<T, K>`.

## Why

`Except<T, K>` from type-fest models omitted keys more strictly and keeps object-shaping conventions aligned with other TypeFest utilities used in this plugin.
