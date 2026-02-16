# Prefer TypeFest Primitive

Require TypeFest `Primitive` over explicit unions of primitive keyword types.

## What it checks

- Unions composed of all primitive keyword types:
  - `string`
  - `number`
  - `bigint`
  - `boolean`
  - `symbol`
  - `null`
  - `undefined`

## Why

`Primitive` communicates intent directly and avoids repeating a long union in multiple places.
