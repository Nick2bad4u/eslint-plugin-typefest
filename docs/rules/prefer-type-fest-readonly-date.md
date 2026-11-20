# prefer-type-fest-readonly-date

Prefer [`ReadonlyDate`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/readonly-date.d.ts) from `type-fest` 6. Describe a readonly view of a Date that omits its setters.

## Targeted pattern scope

The outer `Readonly`, inner `Omit`, and `Date` must resolve to their global types. The omitted keys must match exactly `set${string}`.

## What this rule reports

The rule recognizes the readonly projection even when a project augments the global `Date` with named properties or additional setter methods.

## Why this rule exists

`Readonly<Date>` keeps callable setters such as `setTime`. Removing all setter keys gives a read-only interface and also removes setters added through declaration merging.

## ❌ Incorrect

```ts
type CalendarDate = Readonly<Omit<Date, `set${string}`>>;
```

## ✅ Correct

```ts
import type { ReadonlyDate } from "type-fest";

type CalendarDate = ReadonlyDate;
```

## Behavior and migration notes

The rule requires type information and skips a global `Date` with an index signature because `Omit` can lose the types of individual properties. This type changes compile-time access to the object. Runtime mutation is still possible. A comment inside the matched expression or a conflicting local name prevents an automatic edit.

## Package documentation

TypeFest package documentation:

- [`ReadonlyDate` declaration](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/readonly-date.d.ts)

> **Rule catalog ID:** R147

## Further reading

- [Rule adoption checklist](./guides/adoption-checklist.md)
