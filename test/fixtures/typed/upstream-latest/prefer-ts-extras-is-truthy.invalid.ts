declare const values: readonly (string | undefined)[];
declare const tuple: readonly [
    false,
    0,
    0n,
    "",
    null,
    "ok",
];
declare const unknowns: unknown[];
declare const booleans: boolean[];
declare const bigints: (0n | 2n)[];

export const selected: readonly unknown[] = [
    values.filter(Boolean),
    tuple.filter(Boolean),
    unknowns.filter(Boolean),
    booleans.filter(Boolean),
    bigints.filter(Boolean),
];
