# Prefer TypeFest Simplify

Require TypeFest `Simplify<T>` over imported `Prettify<T>` / `Expand<T>` aliases.

## What it checks

- Type references that resolve to imported `Prettify` aliases.
- Type references that resolve to imported `Expand` aliases.

## Why

`Simplify` is the canonical flattening utility provided by type-fest. Standardizing on it reduces utility-name churn across codebases and keeps helper usage consistent with TypeFest defaults.
