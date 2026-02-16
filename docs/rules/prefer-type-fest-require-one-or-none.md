# Prefer TypeFest RequireOneOrNone

Require TypeFest `RequireOneOrNone<T, Keys>` over imported aliases like `AtMostOne`.

## What it checks

- Type references that resolve to imported `AtMostOne` aliases.

## Why

`RequireOneOrNone` is the canonical TypeFest utility for expressing “zero or exactly one” optional key constraints. Canonical naming keeps type utility usage predictable in public codebases.
