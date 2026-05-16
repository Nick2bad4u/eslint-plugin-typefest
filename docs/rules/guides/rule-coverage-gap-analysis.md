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

## Implemented from this gap list

The following high-confidence type-guard rules have been added since the first
coverage snapshot:

- `prefer-type-fest-is-any`
- `prefer-type-fest-is-never`
- `prefer-type-fest-is-null`
- `prefer-type-fest-is-undefined`

## TypeFest APIs not covered by a direct rule

The following `type-fest` exports currently have no direct rule that prefers
them from an equivalent local type expression. Legacy aliases such as `Opaque`,
`UnwrapOpaque`, and deprecated `If*` utilities are intentionally omitted from
this list because existing rules already cover their migration paths.

### Basic

- `Class`
- `AbstractClass`
- `TypedArray`
- `ObservableLike`
- `LowercaseLetter`
- `UppercaseLetter`
- `DigitCharacter`
- `Alphanumeric`

### Object and utility types

- `EmptyObject`
- `NonEmptyObject`
- `ObjectMerge`
- `MergeDeep`
- `OverrideProperties`
- `SingleKeyObject`
- `PickDeep`
- `OmitDeep`
- `PartialOnUndefinedDeep`
- `UndefinedOnPartialDeep`
- `UnwrapPartial`
- `InvariantOf`
- `SetRequiredDeep`
- `SetNonNullableDeep`
- `LiteralToPrimitive`
- `LiteralToPrimitiveDeep`
- `Entry`
- `Entries`
- `SetParameterType`
- `SimplifyDeep`
- `Get`
- `KeyAsString`
- `Exact`
- `OptionalKeysOf`
- `HasOptionalKeys`
- `RequiredKeysOf`
- `HasRequiredKeys`
- `ReadonlyKeysOf`
- `HasReadonlyKeys`
- `WritableKeysOf`
- `HasWritableKeys`
- `Spread`
- `IsEqual`
- `TaggedUnion`
- `IntRange`
- `IntClosedRange`
- `ArrayIndices`
- `ArrayValues`
- `ArraySplice`
- `ArrayTail`
- `SetFieldType`
- `Paths`
- `SharedUnionFields`
- `SharedUnionFieldsDeep`
- `AllUnionFields`
- `And`
- `Or`
- `Xor`
- `AllExtend`
- `SomeExtend`
- `FindGlobalType`
- `FindGlobalInstanceType`
- `ConditionalSimplify`
- `ConditionalSimplifyDeep`
- `ExclusifyUnion`

### Type guards

- `IsLiteral`
- `IsStringLiteral`
- `IsNumericLiteral`
- `IsBooleanLiteral`
- `IsSymbolLiteral`
- `IsUnknown`
- `IsEmptyObject`
- `IsTuple`
- `IsUnion`
- `IsLowercase`
- `IsUppercase`
- `IsOptional`
- `IsNullable`
- `IsOptionalKeyOf`
- `IsRequiredKeyOf`
- `IsReadonlyKeyOf`
- `IsWritableKeyOf`

### JSON and structured clone

- `Jsonify`
- `Jsonifiable`
- `StructuredCloneable`

### String types

- `Trim`
- `Split`
- `Words`
- `Replace`
- `StringSlice`
- `StringRepeat`
- `RemovePrefix`

### Array and tuple types

- `Includes`
- `Join`
- `ArraySlice`
- `ArrayElement`
- `LastArrayElement`
- `FixedLengthArray`
- `MultidimensionalArray`
- `MultidimensionalReadonlyArray`
- `ReadonlyTuple`
- `TupleToUnion`
- `TupleToObject`
- `SplitOnRestElement`
- `ExtractRestElement`
- `ExcludeRestElement`
- `ArrayReverse`

### Numeric types

- `PositiveInfinity`
- `NegativeInfinity`
- `Finite`
- `Integer`
- `Float`
- `NegativeFloat`
- `Negative`
- `NonNegative`
- `NegativeInteger`
- `NonNegativeInteger`
- `IsNegative`
- `IsFloat`
- `IsInteger`
- `GreaterThan`
- `GreaterThanOrEqual`
- `Sum`
- `Subtract`

### Change-case types

- `CamelCase`
- `CamelCasedProperties`
- `CamelCasedPropertiesDeep`
- `KebabCase`
- `KebabCasedProperties`
- `KebabCasedPropertiesDeep`
- `PascalCase`
- `PascalCasedProperties`
- `PascalCasedPropertiesDeep`
- `SnakeCase`
- `SnakeCasedProperties`
- `SnakeCasedPropertiesDeep`
- `ScreamingSnakeCase`
- `DelimiterCase`
- `DelimiterCasedProperties`
- `DelimiterCasedPropertiesDeep`

### Miscellaneous and strict built-ins

- `GlobalThis`
- `PackageJson`
- `TsConfigJson`
- `ExtendsStrict`
- `ExtractStrict`
- `ExcludeStrict`
- `ExcludeExactly`

## Rule candidates worth building

These are the candidates with enough syntactic signal to justify real rules
without broad type-checker calls or high false-positive rates.

### `prefer-type-fest-array-element`

Detect `T[number]` and `Array<infer Item>` helper aliases when the base is a
generic array or tuple type, and prefer `ArrayElement<T>`.

Do not report `typeof tuple[number]` for constant tuple values. That pattern is
better handled by an `ArrayValues` rule because it means "values of this concrete
array", not "element type of this generic array".

Autofix is reasonable for simple `T[number]` aliases. Conditional `infer`
helpers should probably start as a suggestion.

### `prefer-type-fest-array-values`

Detect `typeof values[number]` when `values` is a `const` array or tuple in the
same module and prefer `ArrayValues<typeof values>`.

This should be type-aware or conservative. Without type information, the rule can
only safely report `typeof identifier[number]` when the identifier is initialized
with an `as const` array literal in the same file.

### `prefer-type-fest-array-indices`

Detect manual index unions derived from tuple keys, such as
`Exclude<keyof typeof tuple, keyof unknown[]>`, when the operand is a constant
tuple and prefer `ArrayIndices<typeof tuple>`.

This is a lower priority than `ArrayValues`. The manual forms vary, and incorrect
autofixes could change string index keys into numeric index keys.

### `prefer-type-fest-entry` and `prefer-type-fest-entries`

Detect common entry-pair aliases:

```ts
type Entry<T> = [keyof T, T[keyof T]];
type Entries<T> = Array<[keyof T, T[keyof T]]>;
```

Prefer `Entry<T>` and `Entries<T>` from `type-fest`.

These are good candidates because the AST shapes are narrow and do not require
deep semantic analysis. The first version should avoid tuple/object/collection
special cases and report only the simplest indexed-access pair patterns.

### `prefer-type-fest-tagged-union`

Detect type aliases that are explicit unions of object type literals sharing the
same discriminant property:

```ts
type Event =
    | {type: "start"; at: Date}
    | {type: "stop"; reason: string};
```

Prefer `TaggedUnion<"type", ...>` when every union member has the same literal
discriminant key and every discriminant value is unique.

This should start without autofix. Preserving comments, property ordering, and
multi-line formatting would make an autofix fragile.

### `prefer-type-fest-type-guards`

This should probably be a small family of rules rather than one large rule:

- `prefer-type-fest-is-unknown`
- `prefer-type-fest-is-tuple`
- `prefer-type-fest-is-union`
- `prefer-type-fest-is-optional-key-of`
- `prefer-type-fest-is-required-key-of`
- `prefer-type-fest-is-readonly-key-of`
- `prefer-type-fest-is-writable-key-of`

Only exact canonical conditional-type shapes should be reported. The initial
implemented rules follow that line: `IsNever<T>`, `IsNull<T>`, and
`IsUndefined<T>` match tuple-wrapped conditionals, while `IsAny<T>` matches the
canonical `0 extends 1 & T` form. Future guard rules should keep avoiding guesses
that every conditional returning `true` or `false` is a `type-fest` guard.

### `prefer-type-fest-empty-object`

Detect exact empty-object intent, not every `{}`.

Good reportable shapes:

- `Record<PropertyKey, never>`
- `Record<string | number | symbol, never>`
- local aliases named `EmptyObject` that expand to the same structure

Bad reportable shape:

- bare `{}` in arbitrary type positions

Bare `{}` in TypeScript often means "any non-nullish value", so reporting it
globally would be noisy and wrong.

### `prefer-type-fest-exact`

Detect local generic aliases that implement exact object checking by adding
`never` properties for excess keys.

This is worth exploring, but it should be conservative and probably start as a
suggestion-only rule. Different "exact" helper types encode assignability
constraints that are not equivalent to `Exact`.

### `prefer-type-fest-strict-builtins`

Cover `ExtendsStrict`, `ExtractStrict`, `ExcludeStrict`, and `ExcludeExactly`,
but do not blindly replace built-in `extends`, `Extract`, or `Exclude`.

These types intentionally have stricter semantics than the built-ins. A rule here
should be opt-in, should explain the semantic change, and should avoid autofix
unless it is replacing an explicitly named local strict helper.

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

## Suggested implementation order

1. Add array and entry extraction rules first:
   `ArrayElement`, `ArrayValues`, `Entry`, and `Entries`.
2. Continue conservative type-guard rules for exact canonical forms:
   `IsUnknown`, `IsTuple`, and the key-modifier guards.
3. Add `TaggedUnion` as a suggestion-only rule.
4. Add opt-in strict built-in rules only after documenting the semantic
   difference in the rule documentation.
5. Leave deep transforms, change-case, numeric, JSON, cloneability, and package
   config types as documented non-goals unless real-world violations justify
   narrowing the scope.
