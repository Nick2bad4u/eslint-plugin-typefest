import type {
    And,
    AndAll,
    ArrayElement,
    ArrayValues,
    Entries,
    Entry,
    ExtractRestElement,
    HasOptionalKeys,
    HasReadonlyKeys,
    HasRequiredKeys,
    HasWritableKeys,
    IsAny,
    IsNever,
    IsNull,
    IsNullable,
    IsOptionalKeyOf,
    IsReadonlyKeyOf,
    IsTuple,
    IsUndefined,
    IsUnknown,
    OptionalKeysOf,
    Or,
    OrAll,
    ReadonlyKeysOf,
    RequiredKeysOf,
    SplitOnRestElement,
    WritableKeysOf,
} from "type-fest";

type ExampleRecord = {
    readonly id: string;
    name?: string;
    active: boolean;
};

const statuses = ["queued", "running"] as const;

type ManualIsAny<Value> = 0 extends 1 & Value ? true : false;
type ManualIsNever<Value> = [Value] extends [never] ? true : false;
type ManualIsNull<Value> = [Value] extends [null] ? true : false;
type ManualIsUndefined<Value> = [Value] extends [undefined] ? true : false;
type ManualIsUnknown<Value> = unknown extends Value
    ? [Value] extends [null]
        ? false
        : true
    : false;
type ManualIsTuple<Value extends readonly unknown[]> =
    number extends Value["length"] ? false : true;
type ManualIsNullable<Value> =
    IsAny<Value> extends true
        ? true
        : Extract<Value, null> extends never
          ? false
          : true;
type ManualAnd = AndAll<[true, boolean]>;
type ManualOr = OrAll<[false, boolean]>;
type ManualExtractRestElement = SplitOnRestElement<
    [
        number,
        ...string[],
        boolean,
    ]
>[1][number];
type ManualHasOptionalKeys<Value extends object> =
    OptionalKeysOf<Value> extends never ? false : true;
type ManualHasRequiredKeys<Value extends object> =
    RequiredKeysOf<Value> extends never ? false : true;
type ManualHasReadonlyKeys<Value extends object> =
    ReadonlyKeysOf<Value> extends never ? false : true;
type ManualHasWritableKeys<Value extends object> =
    WritableKeysOf<Value> extends never ? false : true;
type ManualOptionalKeysOf<Value extends object> = Value extends unknown
    ? keyof {
          [
              Key in keyof Value as IsOptionalKeyOf<Value, Key> extends false
                  ? never
                  : Key
          ]: never;
      } &
          keyof Value
    : never;
type ManualRequiredKeysOf<Value extends object> = Value extends unknown
    ? Exclude<keyof Value, OptionalKeysOf<Value>>
    : never;
type ManualReadonlyKeysOf<Value extends object> = Value extends unknown
    ? keyof {
          [
              Key in keyof Value as IsReadonlyKeyOf<Value, Key> extends false
                  ? never
                  : Key
          ]: never;
      } &
          keyof Value
    : never;
type ManualWritableKeysOf<Value extends object> = Value extends unknown
    ? Exclude<keyof Value, ReadonlyKeysOf<Value>>
    : never;
type ManualEntry<Value> = [keyof Value, Value[keyof Value]];
type ManualEntries<Value> = Array<[keyof Value, Value[keyof Value]]>;
type ManualArrayElement = readonly ["queued", "running"][number];
type ManualArrayValues = (typeof statuses)[number];

export type NewTypeFestGapRuleAutofixSmoke = {
    any: ManualIsAny<unknown>;
    never: ManualIsNever<never>;
    null: ManualIsNull<null>;
    undefined: ManualIsUndefined<undefined>;
    unknown: ManualIsUnknown<unknown>;
    tuple: ManualIsTuple<readonly [string, number]>;
    nullable: ManualIsNullable<null>;
    and: ManualAnd;
    or: ManualOr;
    rest: ManualExtractRestElement;
    hasOptional: ManualHasOptionalKeys<ExampleRecord>;
    hasRequired: ManualHasRequiredKeys<ExampleRecord>;
    hasReadonly: ManualHasReadonlyKeys<ExampleRecord>;
    hasWritable: ManualHasWritableKeys<ExampleRecord>;
    optionalKeys: ManualOptionalKeysOf<ExampleRecord>;
    requiredKeys: ManualRequiredKeysOf<ExampleRecord>;
    readonlyKeys: ManualReadonlyKeysOf<ExampleRecord>;
    writableKeys: ManualWritableKeysOf<ExampleRecord>;
    entry: ManualEntry<ExampleRecord>;
    entries: ManualEntries<ExampleRecord>;
    arrayElement: ManualArrayElement;
    arrayValues: ManualArrayValues;
};

export type ExpectedTypeFestGapHelpers = {
    and: And<true, boolean>;
    arrayElement: ArrayElement<readonly ["queued", "running"]>;
    arrayValues: ArrayValues<typeof statuses>;
    entries: Entries<ExampleRecord>;
    entry: Entry<ExampleRecord>;
    hasOptional: HasOptionalKeys<ExampleRecord>;
    hasReadonly: HasReadonlyKeys<ExampleRecord>;
    hasRequired: HasRequiredKeys<ExampleRecord>;
    hasWritable: HasWritableKeys<ExampleRecord>;
    isAny: IsAny<unknown>;
    isNever: IsNever<never>;
    isNull: IsNull<null>;
    isNullable: IsNullable<null>;
    isTuple: IsTuple<readonly [string, number]>;
    isUndefined: IsUndefined<undefined>;
    isUnknown: IsUnknown<unknown>;
    optionalKeys: OptionalKeysOf<ExampleRecord>;
    or: Or<false, boolean>;
    readonlyKeys: ReadonlyKeysOf<ExampleRecord>;
    requiredKeys: RequiredKeysOf<ExampleRecord>;
    rest: ExtractRestElement<
        [
            number,
            ...string[],
            boolean,
        ]
    >;
    writableKeys: WritableKeysOf<ExampleRecord>;
};
