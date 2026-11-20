declare const payload: unknown;
declare const labels: string | readonly string[];
declare const tuple: readonly [number, string] | undefined;

export const checks: readonly boolean[] = [
    Array.isArray(payload),
    Array.isArray(labels),
    Array.isArray(tuple),
];
