# Prefer TypeFest ConditionalPick

Require TypeFest `ConditionalPick<T, Condition>` over imported aliases like `PickByTypes`.

## What it checks

- Type references that resolve to imported `PickByTypes` aliases.

## Why

`ConditionalPick` is the canonical TypeFest utility for selecting fields by value type. Standardizing on TypeFest naming improves discoverability and lowers migration friction.
