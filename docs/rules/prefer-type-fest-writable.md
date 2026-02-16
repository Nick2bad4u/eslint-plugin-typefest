# Prefer TypeFest Writable

Require TypeFest `Writable` over manual mapped types that remove `readonly` with `-readonly`, and over imported aliases like `Mutable`.

## What it checks

- `{-readonly [K in keyof T]: T[K]}`
- Type references that resolve to imported `Mutable` aliases.

## Why

`Writable<T>` is a standard TypeFest utility for expressing “mutable version of T” and avoids repeating a verbose mapped type pattern.
