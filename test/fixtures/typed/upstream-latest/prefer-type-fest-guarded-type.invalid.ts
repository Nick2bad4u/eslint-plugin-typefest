import type { GuardedType, IsEqual } from "type-fest";

export type ExtractGuard<F> = F extends (
    item: any,
    ...extras: any[]
) => item is infer Result
    ? Result
    : never;
type Assert<T extends true> = T;
type TextGuard = (value: string, options: object) => value is "ready";
type NumberGuard = (value: unknown) => value is number;
type Guards =
    | TextGuard
    | NumberGuard
    | (() => boolean);
export type SameGuard = Assert<
    IsEqual<ExtractGuard<Guards>, GuardedType<Guards>>
>;
export type KeepsTargets = Assert<
    IsEqual<ExtractGuard<Guards>, number | "ready">
>;
