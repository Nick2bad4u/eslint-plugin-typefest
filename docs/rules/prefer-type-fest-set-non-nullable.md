# Prefer TypeFest SetNonNullable

Require TypeFest `SetNonNullable<T, Keys>` over imported aliases like
`NonNullableBy`.

## What it checks

- Type references that resolve to imported `NonNullableBy` aliases.

## Why

`SetNonNullable` is the canonical TypeFest utility for making selected keys
non-nullable. Standardizing on canonical TypeFest naming keeps utility usage
predictable in public TypeScript codebases.
