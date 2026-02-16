# prefer-ts-extras-array-includes

Prefer [`arrayIncludes`](https://github.com/sindresorhus/ts-extras#arrayincludes) from `ts-extras` over `array.includes(...)`.

`arrayIncludes(...)` improves inference and narrowing when checking whether unknown values belong to a known tuple/array.

## ❌ Incorrect

```ts
const hasStatus = statuses.includes(inputStatus);
```

## ✅ Correct

```ts
const hasStatus = arrayIncludes(statuses, inputStatus);
```
