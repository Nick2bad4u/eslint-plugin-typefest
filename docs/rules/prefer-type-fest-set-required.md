# Prefer TypeFest SetRequired

Require TypeFest `SetRequired<T, Keys>` over imported aliases like
`RequiredBy`.

## What it checks

- Type references that resolve to imported `RequiredBy` aliases.

## Why

`SetRequired` is the canonical TypeFest utility for making selected keys
required. Standardizing on TypeFest naming reduces semantic drift between
utility libraries.
