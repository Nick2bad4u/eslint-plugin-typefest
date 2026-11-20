import type { IsEqual, MinimumLengthArray } from "type-fest";

export type Batch<T> = [
    T,
    T,
    ...T[],
];

type Assert<Condition extends true> = Condition;
export type VerifiedExample = Assert<
    IsEqual<Batch<string>, MinimumLengthArray<string, 2>>
>;
