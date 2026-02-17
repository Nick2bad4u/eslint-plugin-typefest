# prefer-ts-extras-safe-cast-to

Prefer [`safeCastTo`](https://github.com/sindresorhus/ts-extras#safecastto) from `ts-extras` over direct `as` assertions when the cast is already assignable.

## What it checks

- `as` and angle-bracket (`<T>value`) assertions in runtime source files.
- Only assertions where the source expression type is assignable to the asserted target type.

## Why

`safeCastTo<T>(value)` keeps casts type-checked and prevents silently widening unsafe assertion patterns.

## ❌ Incorrect

```ts
const nameValue = "Alice" as string;
```

## ✅ Correct

```ts
const nameValue = safeCastTo<string>("Alice");
```
