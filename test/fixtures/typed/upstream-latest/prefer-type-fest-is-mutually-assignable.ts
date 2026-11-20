import type { IsEqual, IsMutuallyAssignable } from "type-fest";

export type Compatible<A, B> = [A] extends [B]
    ? [B] extends [A]
        ? true
        : false
    : false;

type Assert<Condition extends true> = Condition;
export type VerifiedExample = Assert<
    IsEqual<
        Compatible<string | number, number>,
        IsMutuallyAssignable<string | number, number>
    >
>;
