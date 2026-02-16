# Prefer TypeFest UnwrapTagged

Require TypeFest `UnwrapTagged` over imported aliases like `UnwrapOpaque`.

## What it checks

- Type references that resolve to imported `UnwrapOpaque` aliases.

## Why

`UnwrapOpaque` is deprecated in TypeFest in favor of `UnwrapTagged`.
Standardizing on the canonical utility avoids deprecated API usage and keeps
types aligned with current TypeFest docs.
