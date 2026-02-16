# Prefer TypeFest If

Require TypeFest `If` + `Is*` utilities over deprecated aliases like `IfAny`,
`IfNever`, `IfUnknown`, `IfNull`, and `IfEmptyObject`.

## What it checks

- Type references that resolve to imported deprecated aliases:
  - `IfAny`
  - `IfNever`
  - `IfUnknown`
  - `IfNull`
  - `IfEmptyObject`

## Why

These aliases are deprecated in TypeFest. The canonical pattern is to use
`If<...>` with the corresponding `Is*` utility (for example, `If<IsAny<T>, ...>`).

This rule intentionally reports without autofix because migration requires
semantic rewriting, not a one-token rename.
