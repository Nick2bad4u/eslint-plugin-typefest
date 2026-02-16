# Prefer TypeFest AsyncReturnType

Require TypeFest `AsyncReturnType<T>` over `Awaited<ReturnType<T>>` compositions.

## What it checks

- Type references shaped like `Awaited<ReturnType<T>>`.

## Why

`AsyncReturnType<T>` is easier to scan and more explicit about intent than stacking two utility types. Using the TypeFest alias also keeps async return extraction conventions consistent across the codebase.
