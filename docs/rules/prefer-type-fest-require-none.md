# prefer-type-fest-require-none

Prefer [`RequireNone<Keys>`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/require-none.d.ts) from `type-fest` for a mapped type that forbids the presence of every key in `Keys`. This opt-in rule requires Type-fest 6 and is available in the experimental and all presets.

## Targeted pattern scope

A single-parameter type alias must constrain its parameter to the built-in `PropertyKey`. Its right-hand side must map that parameter to optional properties with value type `never`. Both `?` and `+?` match.

## What this rule reports

The diagnostic points to the mapped type. The rule verifies that the key range references the declared parameter and that `PropertyKey` resolves to the built-in definition. A local type named `PropertyKey` may describe a different key range.

## Why this rule exists

`RequireNone` makes a type that forbids specific keys easy to recognize in a larger intersection. With `exactOptionalPropertyTypes` enabled, assigning `undefined` to a forbidden literal key such as `"token"` is an error. A broad key type such as `string` produces an index signature whose values can be `undefined`.

## ❌ Incorrect

```ts
export type Forbidden<Keys extends PropertyKey> = { [P in Keys]?: never };
```

## ✅ Correct

```ts
import type { RequireNone } from "type-fest";

export type Forbidden<Keys extends PropertyKey> = RequireNone<Keys>;
```

## Behavior and migration notes

The rule reports without autofixing. Keep the alias name, constraints, defaults, and exports when replacing its body. An explicit readonly modifier or key remapping can change the resulting type, so those forms receive no diagnostic.

## Additional examples

### ❌ Incorrect — Additional example

```ts
export type PrivateKeys<K extends PropertyKey = "token"> = {
 [Field in K]+?: never;
};
```

### ✅ Correct — Additional example

```ts
import type { RequireNone } from "type-fest";

export type PrivateKeys<K extends PropertyKey = "token"> = RequireNone<K>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Keep the local definition if a consumer must compile against an older Type-fest version or the project exposes the mapped declaration itself as an example.

## Package documentation

TypeFest package documentation:

Source file: [`source/require-none.d.ts`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/require-none.d.ts)

```ts
import type { RequireNone } from "type-fest";

type PublicUser = { name: string } & RequireNone<"password" | "token">;
```

> **Rule catalog ID:** R140

## Further reading

- [TypeScript Handbook on mapped types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [`type-fest` package reference](https://www.npmjs.com/package/type-fest)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
