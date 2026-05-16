---
title: Rule coverage gap analysis
description: Current type-fest and ts-extras API coverage, missing type guards, and candidate rules.
---

# Rule coverage gap analysis

This page tracks the remaining public `type-fest` and `ts-extras` APIs that are not
directly covered by `eslint-plugin-typefest` rules.

Source snapshot:

- [`type-fest` `main` API index](https://github.com/sindresorhus/type-fest/blob/main/index.d.ts)
- [`type-fest` README API catalog](https://github.com/sindresorhus/type-fest#api)
- [`ts-extras` `main` API index](https://github.com/sindresorhus/ts-extras/blob/main/source/index.ts)
- [`ts-extras` README API catalog](https://github.com/sindresorhus/ts-extras#api)

## Current verdict

`ts-extras` does not have an uncovered public export right now. The current
upstream `source/index.ts` exports 33 runtime helpers, and this plugin has a
matching `prefer-ts-extras-*` rule for each helper. The plugin also has two
extra filter-context rules for `isDefined` and `isPresent`, so the `ts-extras`
surface is actually covered more deeply than a one-rule-per-export audit would
require.

The remaining gaps are almost entirely `type-fest` types. That is expected:
`type-fest` exports type-level building blocks whose manual equivalents are not
syntactically stable enough for a safe ESLint rule.

The additional-rule pass is now closed for broad/default rule additions. The
rules implemented from this report cover the high-confidence patterns with
stable syntax and safe autofixes. Remaining candidates should stay documented as
non-goals or future-only ideas unless real project code proves a narrow,
low-noise rule would be correct.

## Implemented from this gap list

The following high-confidence type-guard rules have been added since the first
coverage snapshot:

- `prefer-type-fest-is-any`
- `prefer-type-fest-is-never`
- `prefer-type-fest-is-null`
- `prefer-type-fest-is-undefined`
- `prefer-type-fest-is-unknown`
- `prefer-type-fest-is-tuple`
- `prefer-type-fest-and`
- `prefer-type-fest-or`
- `prefer-type-fest-extract-rest-element`
- `prefer-type-fest-is-nullable`
- `prefer-type-fest-has-optional-keys`
- `prefer-type-fest-has-required-keys`
- `prefer-type-fest-has-readonly-keys`
- `prefer-type-fest-has-writable-keys`
- `prefer-type-fest-optional-keys-of`
- `prefer-type-fest-required-keys-of`
- `prefer-type-fest-readonly-keys-of`
- `prefer-type-fest-writable-keys-of`
- `prefer-type-fest-entry`
- `prefer-type-fest-entries`
- `prefer-type-fest-array-element`
- `prefer-type-fest-array-values`

## TypeFest APIs not covered by a direct rule

The following `type-fest` exports currently have no direct rule that prefers
them from an equivalent local type expression. Legacy aliases such as `Opaque`,
`UnwrapOpaque`, and deprecated `If*` utilities are intentionally omitted from
this list because existing rules already cover their migration paths.

Verdict legend:

- **Consider:** There may be a useful rule, but it should be narrow,
  suggestion-only, opt-in, or based on explicitly named local helper aliases.
  These are not approved for default autofix rules from this gap pass.
- **Do not implement:** A general rule would be too noisy, too project-specific,
  or too likely to change semantics.

### Basic

- `Class` — **Consider:** Only report exact structural class types that include
  both `prototype: Pick<T, keyof T>` and a matching construct signature.
- `AbstractClass` — **Consider:** Same as `Class`, but only for exact abstract
  construct signatures plus the prototype member.
- `TypedArray` — **Do not implement:** Manual typed-array unions are rare and
  vary by project; broad reporting would be name-based.
- `ObservableLike` — **Do not implement:** Structural `subscribe` contracts vary
  too much across observable libraries.
- `LowercaseLetter` — **Do not implement:** Manual character unions are not a
  stable or common enough lint target.
- `UppercaseLetter` — **Do not implement:** Same reason as `LowercaseLetter`.
- `DigitCharacter` — **Do not implement:** Same reason as `LowercaseLetter`.
- `Alphanumeric` — **Do not implement:** Same reason as `LowercaseLetter`.

### Object and utility types

- `EmptyObject` — **Do not implement:** TypeFest's current implementation uses
  an internal unique-symbol brand, and its source explicitly notes that
  `Record<string, never>`, `Record<keyof any, never>`, and related record forms
  do not work as `EmptyObject`.
- `NonEmptyObject` — **Do not implement:** Non-empty object intent is usually a
  semantic constraint, not a stable local type expression.
- `ObjectMerge` — **Do not implement:** This is an internal-style composition
  primitive behind `Merge`; manual equivalents are not stable.
- `MergeDeep` — **Do not implement:** Deep recursive merge helpers are too
  varied and expensive to recognize safely.
- `OverrideProperties` — **Consider:** Only useful for exact local helper aliases
  that intentionally constrain overrides to existing keys.
- `SingleKeyObject` — **Consider:** Could target exact mapped-union helpers, but
  it is likely low frequency.
- `PickDeep` — **Do not implement:** Deep path utilities are project-specific and
  recursive.
- `OmitDeep` — **Do not implement:** Same reason as `PickDeep`.
- `PartialOnUndefinedDeep` — **Do not implement:** Deep undefined-aware
  transforms are too semantic for a general syntax rule.
- `UndefinedOnPartialDeep` — **Do not implement:** Same reason as
  `PartialOnUndefinedDeep`.
- `UnwrapPartial` — **Do not implement:** Manual versions usually appear inside
  larger recursive helpers, not as isolated reportable aliases.
- `InvariantOf` — **Do not implement:** Invariance helpers rely on branding
  tricks that are too easy to get subtly wrong.
- `SetRequiredDeep` — **Do not implement:** Deep mapped transforms are already in
  the risky category.
- `SetNonNullableDeep` — **Do not implement:** Same reason as `SetRequiredDeep`.
- `LiteralToPrimitive` — **Consider:** Only report exact canonical conditional
  aliases; do not guess from arbitrary literal-widening helpers.
- `LiteralToPrimitiveDeep` — **Do not implement:** The deep version becomes a
  recursive transform and is too broad.
- `SetParameterType` — **Consider:** Could replace exact local helper aliases
  that rebuild a function signature with new parameters.
- `SimplifyDeep` — **Do not implement:** Adding `SimplifyDeep` is an intent and
  display-quality choice, not an equivalent syntax rewrite.
- `Get` — **Do not implement:** Path lookup helpers vary heavily and often carry
  different fallback semantics.
- `KeyAsString` — **Consider:** Exact key-to-string helper aliases may be
  reportable, but only with narrow conditional/template-literal matching.
- `Exact` — **Consider:** Suggestion-only for exact excess-property helper
  aliases; avoid autofix because semantics vary.
- `OptionalKeysOf` — **Implemented:** `prefer-type-fest-optional-keys-of`
  reports the exact distributive mapped-key composition based on
  `IsOptionalKeyOf<T, Key>`.
- `HasOptionalKeys` — **Implemented:** `prefer-type-fest-has-optional-keys`
  reports exact `OptionalKeysOf<T> extends never ? false : true` compositions
  imported from `type-fest`.
- `RequiredKeysOf` — **Implemented:** `prefer-type-fest-required-keys-of`
  reports the exact distributive `Exclude<keyof T, OptionalKeysOf<T>>`
  composition.
- `HasRequiredKeys` — **Implemented:** `prefer-type-fest-has-required-keys`
  reports exact `RequiredKeysOf<T> extends never ? false : true` compositions
  imported from `type-fest`.
- `ReadonlyKeysOf` — **Implemented:** `prefer-type-fest-readonly-keys-of`
  reports the exact distributive mapped-key composition based on
  `IsReadonlyKeyOf<T, Key>`.
- `HasReadonlyKeys` — **Implemented:** `prefer-type-fest-has-readonly-keys`
  reports exact `ReadonlyKeysOf<T> extends never ? false : true` compositions
  imported from `type-fest`.
- `WritableKeysOf` — **Implemented:** `prefer-type-fest-writable-keys-of`
  reports the exact distributive `Exclude<keyof T, ReadonlyKeysOf<T>>`
  composition.
- `HasWritableKeys` — **Implemented:** `prefer-type-fest-has-writable-keys`
  reports exact `WritableKeysOf<T> extends never ? false : true` compositions
  imported from `type-fest`.
- `Spread` — **Do not implement:** Spread semantics are intentionally subtle and
  not equivalent to ordinary intersections or merges.
- `IsEqual` — **Do not implement:** Exact mutual-assignability boolean helpers
  look stable at first, but common implementations differ in distribution,
  `any`, `never`, and function-parameter edge cases. A broad rule would be easy
  to make noisy or subtly wrong.
- `TaggedUnion` — **Consider:** Good suggestion-only rule for unions of object
  literals with a shared literal discriminant.
- `IntRange` — **Do not implement:** Numeric range builders are recursive and
  do not have a safe general syntax equivalent.
- `IntClosedRange` — **Do not implement:** Same reason as `IntRange`.
- `ArrayIndices` — **Consider:** Possible for exact tuple-key exclusion helpers,
  but fixers can change string index keys to numeric keys.
- `ArraySplice` — **Do not implement:** Tuple splice helpers are complex
  recursive tuple programs.
- `ArrayTail` — **Consider:** TypeFest preserves readonly arrays, normal arrays,
  empty tuples, leading rest elements, and `any`/`never` behavior. Simple
  `T extends [unknown, ...infer Tail] ? Tail : never` helpers are not
  equivalent.
- `SetFieldType` — **Consider:** Only report exact `Omit<T, K> & Record<K, V>`
  style helper aliases when key constraints match.
- `Paths` — **Do not implement:** Path enumeration is a deep recursive transform.
- `SharedUnionFields` — **Consider:** Potentially suggestion-only for exact local
  helper aliases, but broad structural detection is risky.
- `SharedUnionFieldsDeep` — **Do not implement:** Deep union-field transforms are
  too complex.
- `AllUnionFields` — **Consider:** Same risk profile as `SharedUnionFields`.
- `And` — **Implemented:** `prefer-type-fest-and` reports
  `AndAll<[A, B]>` and `AndAll<readonly [A, B]>` imported from `type-fest`,
  then rewrites them to `And<A, B>`.
- `Or` — **Implemented:** `prefer-type-fest-or` reports `OrAll<[A, B]>` and
  `OrAll<readonly [A, B]>` imported from `type-fest`, then rewrites them to
  `Or<A, B>`.
- `Xor` — **Consider:** TypeFest's boolean `Xor` distributes `boolean` and
  treats `never` as `false`. Only exact boolean-helper compositions should be
  considered; object XOR helpers must stay out of scope.
- `AllExtend` — **Consider:** Useful only for exact local aliases that encode the
  same tuple-wide extends semantics.
- `SomeExtend` — **Consider:** Same constraints as `AllExtend`.
- `FindGlobalType` — **Do not implement:** This is environment-introspection
  intent, not a replaceable local type expression.
- `FindGlobalInstanceType` — **Do not implement:** Same reason as
  `FindGlobalType`.
- `ConditionalSimplify` — **Do not implement:** Simplification choices are
  display-oriented and too intent-heavy.
- `ConditionalSimplifyDeep` — **Do not implement:** Same reason as
  `ConditionalSimplify`, with added deep-recursion risk.
- `ExclusifyUnion` — **Consider:** Suggestion-only for exact `never`-padding
  union helpers; no broad autofix.

### Type guards

- `IsLiteral` — **Consider:** Only if it composes exact string, numeric,
  boolean, and symbol literal guard shapes.
- `IsStringLiteral` — **Consider:** TypeFest handles `any`, `never`, tagged
  types, and infinite string patterns, so only exact aliases that preserve those
  fallbacks are safe.
- `IsNumericLiteral` — **Consider:** TypeFest distributes across numeric
  primitive literal families and handles `never`, so simple
  `T extends number ? number extends T` aliases are not equivalent.
- `IsBooleanLiteral` — **Consider:** Same caveat as `IsNumericLiteral`; simple
  boolean conditionals produce different results for `never`.
- `IsSymbolLiteral` — **Consider:** Same caveat as `IsNumericLiteral`.
- `IsEmptyObject` — **Do not implement:** It depends on TypeFest's branded
  `EmptyObject`; common `T extends {}` or `keyof T extends never` checks are not
  equivalent.
- `IsUnion` — **Consider:** TypeFest preserves `never`, exact equality, and
  boolean fallback behavior. Simple distributive-union helpers are not
  equivalent, so only exact aliases matching the current TypeFest algorithm
  should be considered.
- `IsLowercase` — **Consider:** TypeFest handles string pieces and returns
  `boolean` for uncertain cases, so only exact aliases with equivalent fallback
  behavior are safe.
- `IsUppercase` — **Consider:** Same constraints as `IsLowercase`.
- `IsOptional` — **Consider:** Only report exact `undefined extends T` style
  helpers after checking equivalence with `type-fest` semantics.
- `IsNullable` — **Implemented:** `prefer-type-fest-is-nullable` reports exact
  any-safe nullable guard conditionals that preserve TypeFest's `any` handling.
- `IsOptionalKeyOf` — **Do not implement:** The direct guard semantics include
  TypeFest-specific `any`, distribution, and key-modifier behavior. The safe
  coverage line is the implemented `OptionalKeysOf` and `HasOptionalKeys` rules.
- `IsRequiredKeyOf` — **Do not implement:** Same reason as `IsOptionalKeyOf`.
  The implemented `RequiredKeysOf` and `HasRequiredKeys` rules cover stable
  higher-level compositions instead.
- `IsReadonlyKeyOf` — **Do not implement:** Same reason as `IsOptionalKeyOf`.
  The implemented `ReadonlyKeysOf` and `HasReadonlyKeys` rules cover stable
  higher-level compositions instead.
- `IsWritableKeyOf` — **Do not implement:** Same reason as `IsOptionalKeyOf`.
  The implemented `WritableKeysOf` and `HasWritableKeys` rules cover stable
  higher-level compositions instead.

### JSON and structured clone

- `Jsonify` — **Do not implement:** Manual JSON conversion types vary by project
  and often encode different treatment for methods, dates, maps, and undefined.
- `Jsonifiable` — **Do not implement:** Same reason as `Jsonify`.
- `StructuredCloneable` — **Do not implement:** Cloneability aliases are
  semantic domain contracts, not stable syntax.

### String types

- `Trim` — **Do not implement:** Template-literal parser helpers vary too much.
- `Split` — **Do not implement:** Same reason as `Trim`.
- `Words` — **Do not implement:** Same reason as `Trim`.
- `Replace` — **Do not implement:** Same reason as `Trim`.
- `StringSlice` — **Do not implement:** String slicing helpers are recursive and
  option-sensitive.
- `StringRepeat` — **Do not implement:** Recursive string builders are not a
  stable lint target.
- `RemovePrefix` — **Consider:** Exact `${Prefix}${infer Rest}` aliases may be
  reportable, but only with no custom fallback semantics.

### Array and tuple types

- `Includes` — **Consider:** Exact `Element extends Tuple[number]` helpers may be
  reportable, but false positives are easy when distributivity matters.
- `Join` — **Do not implement:** Tuple/string join helpers are recursive
  template-literal parsers.
- `ArraySlice` — **Do not implement:** Recursive tuple slicing is too complex.
- `LastArrayElement` — **Consider:** TypeFest handles arrays, empty tuples, and
  trailing spread elements. Simple `T extends [...unknown[], infer Last]`
  helpers should not be autofixed unless their narrower semantics are explicit.
- `FixedLengthArray` — **Do not implement:** Recursive tuple builders are not
  stable enough.
- `MultidimensionalArray` — **Do not implement:** This is intent-level type
  modeling rather than a common manual pattern.
- `MultidimensionalReadonlyArray` — **Do not implement:** Same reason as
  `MultidimensionalArray`.
- `ReadonlyTuple` — **Consider:** Only report exact mutable-tuple-to-readonly
  helper aliases; avoid broad readonly tuple syntax.
- `TupleToUnion` — **Do not implement:** `T[number]` is already owned by
  `prefer-type-fest-array-element`, and adding a second rule would duplicate
  reports.
- `TupleToObject` — **Consider:** Exact tuple-to-object mapped aliases may be
  reportable, but likely low priority.
- `SplitOnRestElement` — **Consider:** Exact variadic rest split aliases may be
  reportable without autofix.
- `ExtractRestElement` — **Implemented:** `prefer-type-fest-extract-rest-element`
  reports exact `SplitOnRestElement<T>[1][number]` usage imported from
  `type-fest` and rewrites it to `ExtractRestElement<T>`.
- `ExcludeRestElement` — **Consider:** TypeFest composes `SplitOnRestElement`
  with readonly and `any`/`never` preservation. Manual tuple-spread removal
  helpers are only safe if matched as an exact helper composition.
- `ArrayReverse` — **Do not implement:** Recursive tuple reversal is too broad.

### Numeric types

- `PositiveInfinity` — **Do not implement:** No safe normal-code equivalent.
- `NegativeInfinity` — **Do not implement:** No safe normal-code equivalent.
- `Finite` — **Do not implement:** Numeric branding/range aliases are semantic
  and project-specific.
- `Integer` — **Do not implement:** Same reason as `Finite`.
- `Float` — **Do not implement:** Same reason as `Finite`.
- `NegativeFloat` — **Do not implement:** Same reason as `Finite`.
- `Negative` — **Do not implement:** Same reason as `Finite`.
- `NonNegative` — **Do not implement:** Same reason as `Finite`.
- `NegativeInteger` — **Do not implement:** Same reason as `Finite`.
- `NonNegativeInteger` — **Do not implement:** Same reason as `Finite`.
- `IsNegative` — **Do not implement:** Numeric sign checks are implemented with
  varied string/numeric helper stacks.
- `IsFloat` — **Do not implement:** Same reason as `IsNegative`.
- `IsInteger` — **Do not implement:** Same reason as `IsNegative`.
- `GreaterThan` — **Consider:** Only report aliases that reverse existing
  `LessThan` usage; do not detect manual numeric algorithms.
- `GreaterThanOrEqual` — **Consider:** Same rule shape as `GreaterThan`, using
  `LessThanOrEqual`.
- `Sum` — **Do not implement:** Type-level arithmetic helpers are recursive and
  project-specific.
- `Subtract` — **Do not implement:** Same reason as `Sum`.

### Change-case types

- `CamelCase` — **Do not implement:** Manual case parsers are not stable syntax.
- `CamelCasedProperties` — **Do not implement:** Property-case transforms add
  mapped-type and option semantics.
- `CamelCasedPropertiesDeep` — **Do not implement:** Deep property transforms are
  too complex.
- `KebabCase` — **Do not implement:** Same reason as `CamelCase`.
- `KebabCasedProperties` — **Do not implement:** Same reason as
  `CamelCasedProperties`.
- `KebabCasedPropertiesDeep` — **Do not implement:** Same reason as
  `CamelCasedPropertiesDeep`.
- `PascalCase` — **Do not implement:** Same reason as `CamelCase`.
- `PascalCasedProperties` — **Do not implement:** Same reason as
  `CamelCasedProperties`.
- `PascalCasedPropertiesDeep` — **Do not implement:** Same reason as
  `CamelCasedPropertiesDeep`.
- `SnakeCase` — **Do not implement:** Same reason as `CamelCase`.
- `SnakeCasedProperties` — **Do not implement:** Same reason as
  `CamelCasedProperties`.
- `SnakeCasedPropertiesDeep` — **Do not implement:** Same reason as
  `CamelCasedPropertiesDeep`.
- `ScreamingSnakeCase` — **Do not implement:** Same reason as `CamelCase`.
- `DelimiterCase` — **Do not implement:** Same reason as `CamelCase`.
- `DelimiterCasedProperties` — **Do not implement:** Same reason as
  `CamelCasedProperties`.
- `DelimiterCasedPropertiesDeep` — **Do not implement:** Same reason as
  `CamelCasedPropertiesDeep`.

### Miscellaneous and strict built-ins

- `GlobalThis` — **Do not implement:** Replacing `typeof globalThis` would be an
  opinionated style change rather than a semantic improvement.
- `PackageJson` — **Consider:** Only report local aliases named exactly
  `PackageJson` or equivalent project-specific migration patterns.
- `TsConfigJson` — **Consider:** Same constraints as `PackageJson`.
- `ExtendsStrict` — **Consider:** Opt-in only; document the stricter semantics
  and avoid replacing ordinary conditional types.
- `ExtractStrict` — **Consider:** Opt-in only; replace explicitly named local
  strict helpers, not normal `Extract`.
- `ExcludeStrict` — **Consider:** Opt-in only; replace explicitly named local
  strict helpers, not normal `Exclude`.
- `ExcludeExactly` — **Consider:** Opt-in only; replace explicitly named local
  strict helpers where exact exclusion semantics are clear.

## Closed candidates and future-only ideas

No remaining candidate from this report should be built as a default autofix
rule right now. The implemented rules below are the completed high-confidence
set. The unimplemented entries in this section are retained only as future
research notes for opt-in, suggestion-only, or explicitly named local-helper
migrations.

### Implemented: `prefer-type-fest-array-element`

This rule now detects `T[number]` when `T` resolves to an array or tuple type,
and prefers `ArrayElement<T>`.

The implemented scope is intentionally type-aware:

- Reports `T[number]` only when the TypeScript checker resolves `T` to an
  array-like type.
- Leaves `typeof tuple[number]` alone for a future `ArrayValues` rule.
- Ignores number-indexed object maps where `ArrayElement<T>` would not be
  equivalent.
- Does not yet rewrite conditional `infer` helper aliases. Those should start as
  suggestions if added later.

### Implemented: `prefer-type-fest-array-values`

This rule now detects `typeof values[number]` when `values` resolves to an array
or tuple type, and prefers `ArrayValues<typeof values>`.

The implemented scope is intentionally type-aware:

- Reports only `typeof values[number]` where the TypeScript checker resolves
  `values` to an array-like type.
- Leaves plain `T[number]` to `prefer-type-fest-array-element`.
- Ignores number-indexed object maps where `ArrayValues<typeof values>` would not
  be equivalent.

### Deferred: `prefer-type-fest-array-indices`

Detect manual index unions derived from tuple keys, such as
`Exclude<keyof typeof tuple, keyof unknown[]>`, when the operand is a constant
tuple and prefer `ArrayIndices<typeof tuple>`.

This should stay deferred. The manual forms vary, and incorrect autofixes could
change string index keys into numeric index keys.

### Implemented: `prefer-type-fest-entry` and `prefer-type-fest-entries`

These rules now cover exact object-entry pair aliases:

```ts
type ObjectEntry<T> = [keyof T, T[keyof T]];
type ObjectEntries<T> = Array<[keyof T, T[keyof T]]>;
```

The implemented scope is intentionally narrow:

- `prefer-type-fest-entry` reports `[keyof T, T[keyof T]]`.
- `prefer-type-fest-entries` reports `Array<[keyof T, T[keyof T]]>` and
  `[keyof T, T[keyof T]][]`.
- `ReadonlyArray<[keyof T, T[keyof T]]>` is left alone until readonly
  collection semantics are modeled explicitly.
- `prefer-type-fest-value-of` now defers inside exact entry tuple patterns so a
  single manual entry tuple does not produce duplicate `Entry` and `ValueOf`
  reports.

### Deferred: `prefer-type-fest-tagged-union`

Detect type aliases that are explicit unions of object type literals sharing the
same discriminant property:

```ts
type Event =
    | {type: "start"; at: Date}
    | {type: "stop"; reason: string};
```

Prefer `TaggedUnion<"type", ...>` when every union member has the same literal
discriminant key and every discriminant value is unique.

This should not be added from the current gap pass. If real-world usage justifies
it later, it should start without autofix because preserving comments, property
ordering, and multi-line formatting would make a fix fragile.

### `prefer-type-fest-type-guards`

The safe family of type-guard rules from this pass has already been added:

- Implemented: `prefer-type-fest-is-unknown`
- Implemented: `prefer-type-fest-is-tuple`
- Implemented: `prefer-type-fest-is-nullable`

Only exact canonical conditional-type shapes should be reported. The initial
implemented rules follow that line: `IsNever<T>`, `IsNull<T>`, and
`IsUndefined<T>` match tuple-wrapped conditionals, while `IsAny<T>` matches the
canonical `0 extends 1 & T` form. `IsNullable<T>` now only reports the exact
any-safe nullable helper shape; it intentionally ignores shorter
`Extract<T, null>` checks because they do not preserve `any` behavior. Future
guard rules should not be added without real-world examples and exact semantic
proof that `any`, `never`, distribution, and modifier behavior are preserved.

### Implemented: `prefer-type-fest-and` and `prefer-type-fest-or`

These rules now cover the exact two-value forms of the existing all-value
boolean helpers:

```ts
type Both<A extends boolean, B extends boolean> = AndAll<[A, B]>;
type Either<A extends boolean, B extends boolean> = OrAll<[A, B]>;
```

The implemented scope is intentionally narrow:

- Reports direct and namespace-qualified `AndAll`/`OrAll` references imported
  from `type-fest`.
- Only rewrites two-element tuple arguments, including `readonly [A, B]`.
- Leaves three-or-more-element tuple checks on `AndAll`/`OrAll`.
- Skips named, optional, and rest tuple elements because those cannot be safely
  converted into ordinary generic arguments.

### Do not implement: `prefer-type-fest-empty-object`

Detect exact empty-object intent, not every `{}`.

Originally suggested reportable shapes:

- `Record<PropertyKey, never>`
- `Record<string | number | symbol, never>`
- local aliases named `EmptyObject` that expand to the same structure

Bad reportable shape:

- bare `{}` in arbitrary type positions

This should stay out of scope. Bare `{}` in TypeScript often means "any
non-nullish value", and TypeFest's own docs say the `Record<..., never>` forms do
not work as `EmptyObject`.

### Implemented: `prefer-type-fest-extract-rest-element`

This rule now covers the exact TypeFest helper composition:

```ts
type Rest<T extends UnknownArray> = SplitOnRestElement<T>[1][number];
```

The implemented scope is intentionally narrow:

- Reports direct and namespace-qualified `SplitOnRestElement` references
  imported from `type-fest`.
- Only rewrites the exact `[1][number]` rest-element extraction.
- Leaves the raw split tuple segments alone.

### Implemented: `prefer-type-fest-is-nullable`

This rule now covers exact nullable checks that preserve TypeFest's `any`
behavior:

```ts
type Result<T> = IsAny<T> extends true ? true : Extract<T, null> extends never ? false : true;
type Result<T> = 0 extends 1 & T ? true : Extract<T, null> extends never ? false : true;
```

The implemented scope is intentionally narrow:

- Reports direct, aliased, and namespace-qualified `IsAny` references imported
  from `type-fest`.
- Reports the canonical manual `0 extends 1 & T` any branch.
- Only rewrites when the inner branch is exactly
  `Extract<T, null> extends never ? false : true` for the same `T`.
- Leaves the shorter `Extract<T, null>` nullable guard alone because it changes
  behavior for `any`.

### Implemented: `prefer-type-fest-has-*keys`

These rules now cover exact TypeFest key-existence helper compositions:

```ts
type HasOptionals<T extends object> = OptionalKeysOf<T> extends never ? false : true;
type HasRequired<T extends object> = RequiredKeysOf<T> extends never ? false : true;
type HasReadonly<T extends object> = ReadonlyKeysOf<T> extends never ? false : true;
type HasWritable<T extends object> = WritableKeysOf<T> extends never ? false : true;
```

The implemented scope is intentionally narrow:

- Reports direct, aliased, and namespace-qualified `*KeysOf` references imported
  from `type-fest`.
- Only rewrites the exact `extends never ? false : true` shape.
- Leaves inverted checks and custom fallback branches alone.
- Leaves local `*KeysOf` helpers alone.

### Implemented: `prefer-type-fest-*keys-of`

These rules now cover exact TypeFest key-extraction helper compositions:

```ts
type Optional<Type extends object> = Type extends unknown
    ? (keyof {[Key in keyof Type as IsOptionalKeyOf<Type, Key> extends false ? never : Key]: never}) &
          keyof Type
    : never;

type Required<Type extends object> = Type extends unknown
    ? Exclude<keyof Type, OptionalKeysOf<Type>>
    : never;
```

The implemented scope is intentionally narrow:

- `prefer-type-fest-optional-keys-of` and
  `prefer-type-fest-readonly-keys-of` report only the exact distributive
  mapped-key shape based on TypeFest `IsOptionalKeyOf`/`IsReadonlyKeyOf`.
- `prefer-type-fest-required-keys-of` and
  `prefer-type-fest-writable-keys-of` report only the exact distributive
  `Exclude<keyof T, *KeysOf<T>>` shape.
- Direct, aliased, and namespace-qualified TypeFest helper imports are
  supported.
- Non-distributive helpers, local helper types, custom key filters, and reversed
  exclusions are ignored.

### Deferred: `prefer-type-fest-exact`

Detect local generic aliases that implement exact object checking by adding
`never` properties for excess keys.

This should stay deferred. Different "exact" helper types encode assignability
constraints that are not equivalent to `Exact`; a future rule would need to be
conservative and suggestion-only.

### Deferred: `prefer-type-fest-strict-builtins`

Cover `ExtendsStrict`, `ExtractStrict`, `ExcludeStrict`, and `ExcludeExactly`,
but do not blindly replace built-in `extends`, `Extract`, or `Exclude`.

These types intentionally have stricter semantics than the built-ins. A future
rule here would need to be opt-in, document the semantic change, and avoid
autofix unless it is replacing an explicitly named local strict helper.

## Low-value or risky candidates

These APIs should stay out of the plugin unless there is a specific repeated
pattern in real projects.

### Deep object transforms

`MergeDeep`, `PickDeep`, `OmitDeep`, `SetRequiredDeep`,
`SetNonNullableDeep`, `Paths`, `Get`, `SharedUnionFieldsDeep`, and similar deep
helpers are hard to detect safely. Manual versions are usually recursive type
programs with valid forms across codebases. A rule would either miss real code or
become an expensive broad traversal over conditional, mapped, and indexed-access
types.

### Change-case utilities

`CamelCase`, `SnakeCase`, `KebabCase`, `PascalCase`, delimiter-case variants, and
property-case variants should not be enforced from syntax unless the project has
a project-specific local helper name to migrate. Their manual implementations are
type-level parsers, not stable AST patterns.

### Numeric computation and branded numeric types

`Finite`, `Integer`, `NonNegative`, `IntRange`, `Sum`, `Subtract`,
`GreaterThan`, and similar numeric utilities do not have a reliable syntactic
equivalent in normal user code. Rules here would often become name-based
migrations from local aliases, which is too project-specific for a general
plugin rule.

### JSON and cloneability types

`Jsonify`, `Jsonifiable`, and `StructuredCloneable` are useful types, but manual
serializability aliases vary heavily by project. A general rule should not guess
that a type named `Serializable`, `JsonCompatible`, or `Cloneable` is equivalent.

### Package config types

`PackageJson` and `TsConfigJson` are useful, but intent is hard to infer from an
object type alias. A future rule could report local aliases with those exact
names, but broad detection would be noisy.

## Closure policy

1. Do not add more default or recommended autofix rules from this gap list
   without real-world examples that demonstrate a repeated, low-noise pattern.
2. Any future candidate whose semantics differ from the manual form must start
   suggestion-only or opt-in.
3. Autofix candidates must include direct, aliased, and namespace import tests
   where import-aware; shadowed-name no-fix tests; false-positive valid cases;
   fixer output assertions; and parse-safety coverage.
4. Keep deep transforms, change-case, numeric, JSON, cloneability, package
   config, and broad type-guard APIs as documented non-goals unless the scope can
   be narrowed to an exact local-helper migration.
