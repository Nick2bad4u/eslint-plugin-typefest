# prefer-type-fest-not

Use `Not<Flag>` to negate a boolean type expressed as `If<Flag, false, true>`. This experimental rule requires `type-fest` 6.x.

## Targeted pattern scope

The rule checks that `If` resolves to a named, aliased, or namespace import from `type-fest` and that its second and third arguments are the literal types `false` and `true`, in that order.

## What this rule reports

The diagnostic highlights the complete `If` reference. Local types with the same name and ordinary TypeScript conditional types are outside its scope.

## Why this rule exists

TypeFest defines `Not<A>` as `If<A, false, true>`. Both accept boolean type parameters and produce the same results for `boolean`, `any`, and `never`.

## ❌ Incorrect

```ts
import type { If } from "type-fest";

export type IsDisabled<Enabled extends boolean> = If<Enabled, false, true>;
```

## ✅ Correct

```ts
import type { Not } from "type-fest";

export type IsDisabled<Enabled extends boolean> = Not<Enabled>;
```

## Behavior and migration notes

The replacement keeps the condition as written. A comment inside the expression or a conflicting local binding can make the diagnostic report-only.

## Package documentation

TypeFest package documentation:

Source file: [`source/not.d.ts`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/not.d.ts)

> **Rule catalog ID:** R146

## Further reading

- [TypeFest `If` declaration](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/if.d.ts)
