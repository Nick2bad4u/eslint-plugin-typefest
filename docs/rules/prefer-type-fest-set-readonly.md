# Prefer TypeFest SetReadonly

Require TypeFest `SetReadonly<T, Keys>` over imported aliases like
`ReadonlyBy`.

## What it checks

- Type references that resolve to imported `ReadonlyBy` aliases.

## Why

`SetReadonly` is the canonical TypeFest utility for making selected keys
readonly. Canonical naming improves discoverability and consistency across
projects.
