# Prefer TypeFest Schema

Require TypeFest `Schema<ObjectType, ValueType>` over imported aliases like `RecordDeep`.

## What it checks

- Type references that resolve to imported `RecordDeep` aliases.

## Why

`Schema` is the canonical TypeFest utility for deep value-shape transformation across object types. Standardized naming helps readers recognize intent immediately.
