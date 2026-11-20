# prefer-type-fest-subset-of

Prefer [`SubsetOf`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/subset-of.d.ts) from `type-fest` 6 for the following pattern.

## Targeted pattern scope

An alias with two parameters whose second parameter extends the first and is returned unchanged.

## What this rule reports

```ts
type Allowed<Domain, Selection extends Domain> = Selection;
```

## Why this rule exists

This helper validates the constraint while preserving the selected subtype and its literal information.

## ❌ Incorrect

```ts
type Allowed<Domain, Selection extends Domain> = Selection;
```

## ✅ Correct

```ts
import type { SubsetOf } from "type-fest";

type Allowed<Domain, Selection extends Domain> = SubsetOf<Domain, Selection>;
```

## Behavior and migration notes

The rule runs when the linted file resolves `type-fest` major version 6. It preserves the outer alias and its parameters. The fixer leaves comments in place and uses the configured import policy.

## Package documentation

TypeFest package documentation:

- [`SubsetOf` declaration](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/subset-of.d.ts)

> **Rule catalog ID:** R139

## Further reading

- [Rule adoption checklist](./guides/adoption-checklist.md)
