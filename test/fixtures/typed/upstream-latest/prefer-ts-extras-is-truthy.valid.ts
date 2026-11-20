import { isTruthy } from "ts-extras";

declare const values: (string | undefined)[];
declare const numeric: number[];
declare const strings: string[];
declare const ignoredReturnValues: void[];
declare const literals: readonly (
    | false
    | 0
    | 0n
    | ""
    | "on"
    | 1
)[];
declare const dynamic: any[];
declare const typed: Uint8Array;
declare const custom: {
    filter: (callback: BooleanConstructor) => (string | undefined)[];
};

export function checkShadowed(Boolean: (value: unknown) => boolean): unknown[] {
    return values.filter(Boolean);
}

export const selected: readonly unknown[] = [
    numeric.filter(Boolean),
    strings.filter(Boolean),
    ignoredReturnValues.filter(Boolean),
    dynamic.filter(Boolean),
    typed.filter(Boolean),
    custom.filter(Boolean),
    values.filter((value) => !value),
    values.filter(Boolean, {}),
    values.filter?.(Boolean),
    values["filter"](Boolean),
    values.map(Boolean),
];

export const retainedLiterals: ("on" | 1)[] = literals.filter(isTruthy);
export const retainedStrings: string[] = values.filter(isTruthy);
