# Prefer TypeFest Writable

Require TypeFest `Writable` over manual mapped types that remove `readonly` with `-readonly`.

## What it checks

- `{-readonly [K in keyof T]: T[K]}`

## Why

`Writable<T>` is a standard TypeFest utility for expressing “mutable version of T” and avoids repeating a verbose mapped type pattern.
