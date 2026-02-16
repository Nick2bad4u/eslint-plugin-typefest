# Prefer TypeFest IterableElement

Require TypeFest `IterableElement<T>` over imported aliases like `SetElement`, `SetEntry`, and `SetValues`.

## What it checks

- Type references that resolve to imported `SetElement` aliases.
- Type references that resolve to imported `SetEntry` aliases.
- Type references that resolve to imported `SetValues` aliases.

## Why

`IterableElement` is the canonical TypeFest utility for extracting element types from iterable collections. Consolidating on one name makes collection type extraction patterns easier to audit and maintain.
