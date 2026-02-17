# prefer-ts-extras-as-writable

Prefer [`asWritable`](https://github.com/sindresorhus/ts-extras#aswritable) from `ts-extras` over `Writable<...>` type assertions.

## What it checks

- `as` assertions where the asserted type is `Writable<...>` imported from `type-fest`.
- Namespace-qualified assertions such as `TypeFest.Writable<...>` when `TypeFest` comes from `type-fest`.

## Why

`asWritable(value)` communicates intent directly and keeps mutation-intent casts aligned with the `ts-extras` helper API.

## ❌ Incorrect

```ts
import type { Writable } from "type-fest";

const writableUser = readonlyUser as Writable<User>;
```

## ✅ Correct

```ts
import { asWritable } from "ts-extras";

const writableUser = asWritable(readonlyUser);
```
