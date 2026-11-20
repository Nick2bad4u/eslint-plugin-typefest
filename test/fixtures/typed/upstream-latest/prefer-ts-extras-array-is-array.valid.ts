import { arrayIsArray } from "ts-extras";

declare const payload: unknown;
declare const count: number;
declare const mutable: number[] | string;
declare const dynamic: any;
declare const custom: { isArray: (value: unknown) => boolean };

export function narrowReadonly(value: string | readonly [string]): string {
    if (arrayIsArray(value)) {
        const tuple: readonly [string] = value;
        return tuple[0];
    }
    return value;
}

export function checkGeneric<T>(value: T | readonly T[]): boolean {
    return Array.isArray(value);
}

export function checkIndexed<T, Key extends keyof T>(
    value: T[Key] | readonly T[Key][]
): boolean {
    return Array.isArray(value);
}

export function checkIntersection<T>(
    value: (T & { label: string }) | readonly T[]
): boolean {
    return Array.isArray(value);
}

export function checkShadowed(Array: typeof custom): boolean {
    return Array.isArray(payload);
}

export const checks: readonly boolean[] = [
    Array.isArray(count),
    Array.isArray(mutable),
    Array.isArray(dynamic),
    custom.isArray(payload),
    Array["isArray"](payload),
    Array.isArray?.(payload),
];
