# prefer-ts-extras-object-entries

Prefer [`objectEntries`](https://github.com/sindresorhus/ts-extras#objectentries) from `ts-extras` over `Object.entries(...)`.

`objectEntries(...)` preserves stronger key/value typing for object iteration and reduces local casting noise.

## ❌ Incorrect

```ts
const pairs = Object.entries(siteStatusById);
```

## ✅ Correct

```ts
const pairs = objectEntries(siteStatusById);
```
