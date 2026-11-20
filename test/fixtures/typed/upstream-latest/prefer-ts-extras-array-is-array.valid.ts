import { arrayIsArray } from "ts-extras";

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
