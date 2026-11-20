import type { IsEqual, AsyncFunction } from "type-fest";

export type Loader<Args extends readonly unknown[], Result> = (
    ...args: Args
) => Promise<Result>;

type Assert<Condition extends true> = Condition;
export type VerifiedExample = Assert<
    IsEqual<Loader<[id: string], number>, AsyncFunction<[id: string], number>>
>;
