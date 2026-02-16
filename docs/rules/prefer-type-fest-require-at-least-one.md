# Prefer TypeFest RequireAtLeastOne

Require TypeFest `RequireAtLeastOne<T, Keys>` over imported aliases like
`AtLeastOne`.

## What it checks

- Type references that resolve to imported `AtLeastOne` aliases.

## Why

`RequireAtLeastOne` is the canonical TypeFest utility for enforcing at least one
required key among a set of optional candidates. Standardizing on canonical
TypeFest naming keeps public type contracts easier to understand and migrate.
