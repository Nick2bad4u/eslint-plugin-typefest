import type { IsEqual, Falsy, Truthy } from "type-fest";

export type Clean<T> = NonNullable<Exclude<T, Falsy | void>>;

type Assert<Condition extends true> = Condition;
export type VerifiedExample = Assert<
    IsEqual<
        Clean<
            | 0
            | 1
            | undefined
        >,
        Truthy<
            | 0
            | 1
            | undefined
        >
    >
>;
