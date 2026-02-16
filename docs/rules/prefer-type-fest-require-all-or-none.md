# Prefer TypeFest RequireAllOrNone

Require TypeFest `RequireAllOrNone<T, Keys>` over imported aliases like
`AllOrNone` or `AllOrNothing`.

## What it checks

- Type references that resolve to imported `AllOrNone` aliases.
- Type references that resolve to imported `AllOrNothing` aliases.

## Why

`RequireAllOrNone` is the canonical TypeFest utility for expressing atomic key
groups (either every key in the group exists, or none of them do). Canonical
naming reduces semantic drift across utility libraries.
