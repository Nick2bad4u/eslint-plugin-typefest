declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;

declare const nullableEntries: readonly (string | null)[];
declare const nullableMonitors: readonly (null | { readonly id: string } | undefined)[];
declare const maybeNumbers: readonly (null | number | undefined)[];

const entries = nullableEntries.filter(isPresent);
const monitors = nullableMonitors.filter(isPresent);
const numbers = maybeNumbers.filter(isPresent);

if (entries.length + monitors.length + numbers.length < 0) {
    throw new TypeError("Unreachable total count");
}

export const __typedFixtureModule = "typed-fixture-module";
