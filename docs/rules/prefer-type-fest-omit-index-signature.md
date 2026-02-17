# Prefer TypeFest OmitIndexSignature

Require TypeFest `OmitIndexSignature<T>` over imported aliases like
`RemoveIndexSignature`.

## What it checks

- Type references that resolve to imported `RemoveIndexSignature` aliases.

## Why

`OmitIndexSignature` is the canonical TypeFest utility for stripping index
signatures while preserving explicitly-declared fields. Using the canonical
name reduces migration friction across utility libraries.
