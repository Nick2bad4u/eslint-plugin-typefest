import type { IsEqual, Falsy } from "type-fest";

export type Local =
    | false
    | null
    | 0n
    | undefined
    | ""
    | 0;

type Assert<Condition extends true> = Condition;
export type VerifiedExample = Assert<IsEqual<Local, Falsy>>;
