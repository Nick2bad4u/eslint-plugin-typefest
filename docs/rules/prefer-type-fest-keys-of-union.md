# Prefer TypeFest KeysOfUnion

Require TypeFest `KeysOfUnion<T>` over imported aliases like `AllKeys`.

## What it checks

- Type references that resolve to imported `AllKeys` aliases.

## Why

`KeysOfUnion` is the canonical TypeFest utility for extracting the full key union across object unions. Using canonical utility names improves readability and consistency.
