# Prefer TypeFest Arrayable

Require TypeFest `Arrayable<T>` over `T | T[]` and `T | Array<T>` unions.

## What it checks

- `T | T[]`
- `T | Array<T>`

## Why

`Arrayable<T>` is clearer and more consistent than repeating union patterns. It also aligns code with TypeFest utility conventions used by other rules in this plugin.
