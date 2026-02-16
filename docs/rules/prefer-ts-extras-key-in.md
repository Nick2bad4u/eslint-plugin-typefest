# prefer-ts-extras-key-in

Prefer [`keyIn`](https://github.com/sindresorhus/ts-extras#keyin) from `ts-extras` over `key in object` checks.

`keyIn(...)` provides better key narrowing for dynamic property checks.

## ❌ Incorrect

```ts
if (key in payload) {
    // ...
}
```

## ✅ Correct

```ts
if (keyIn(key, payload)) {
    // ...
}
```
