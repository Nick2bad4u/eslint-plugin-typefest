# Prefer TypeFest SetOptional

Require TypeFest `SetOptional<T, Keys>` over imported aliases like `PartialBy`.

## What it checks

- Type references that resolve to imported `PartialBy` aliases.

## Why

`SetOptional` is the canonical TypeFest utility for making selected keys optional. Standardizing on it improves discoverability and keeps utility naming consistent across projects.
