# prefer-type-fest-required-non-nullable

Prefer [`RequiredNonNullable<T>`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/required-non-nullable.d.ts) from `type-fest` for a mapped type that requires every property and removes `null` and `undefined` from each property value. This opt-in rule requires Type-fest 6 and is available in the experimental and all presets.

## Targeted pattern scope

A single-parameter type alias must map over `keyof` that parameter, remove the optional modifier with `-?`, and apply the built-in `NonNullable` to the corresponding indexed access.

## What this rule reports

The diagnostic points to the mapped type. Both references to the source type must resolve to the alias parameter, and the index in the property value must resolve to the mapped key. Explicit readonly changes, remapped keys, and locally defined `NonNullable` types are outside its scope.

## Why this rule exists

`RequiredNonNullable` states the two guarantees at the point of use. It preserves existing readonly properties and applies the transformation to the immediate properties of the input.

## ❌ Incorrect

```ts
export type Present<T> = { [K in keyof T]-?: NonNullable<T[K]> };
```

## ✅ Correct

```ts
import type { RequiredNonNullable } from "type-fest";

export type Present<T> = RequiredNonNullable<T>;
```

## Behavior and migration notes

The rule reports without autofixing. Keep the alias name, generic constraints, defaults, and exports. Nested nullable properties keep their original types. If the module already uses the name `RequiredNonNullable`, import it under a local alias.

## Additional examples

### ❌ Incorrect — Additional example

```ts
export type Checked<T extends object> = {
 [Field in keyof T]-?: NonNullable<T[Field]>;
};
```

### ✅ Correct — Additional example

```ts
import type { RequiredNonNullable } from "type-fest";

export type Checked<T extends object> = RequiredNonNullable<T>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Keep a local definition when your library supports older Type-fest versions or uses this type to teach mapped-type modifiers.

## Package documentation

TypeFest package documentation:

Source file: [`source/required-non-nullable.d.ts`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/required-non-nullable.d.ts)

```ts
import type { RequiredNonNullable } from "type-fest";

type Settings = { readonly host?: string | null; port?: number };
type Configured = RequiredNonNullable<Settings>;
```

> **Rule catalog ID:** R141

## Further reading

- [TypeScript Handbook on mapped types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [`type-fest` package reference](https://www.npmjs.com/package/type-fest)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
