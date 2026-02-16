# Prefer TypeFest RequireExactlyOne

Require TypeFest `RequireExactlyOne<T, Keys>` over imported aliases like `OneOf` or `RequireOnlyOne`.

## What it checks

- Type references that resolve to imported `OneOf` aliases.
- Type references that resolve to imported `RequireOnlyOne` aliases.

## Why

`RequireExactlyOne` is the canonical TypeFest utility for enforcing exactly one active key among a set. Using the canonical name reduces semantic drift between utility libraries.
