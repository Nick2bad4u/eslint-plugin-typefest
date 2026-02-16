# prefer-ts-extras-object-values

Prefer [`objectValues`](https://github.com/sindresorhus/ts-extras#objectvalues) from `ts-extras` over `Object.values(...)`.

`objectValues(...)` preserves stronger value typing and keeps value iteration contracts explicit.

## ❌ Incorrect

```ts
const values = Object.values(siteStateMap);
```

## ✅ Correct

```ts
const values = objectValues(siteStateMap);
```
