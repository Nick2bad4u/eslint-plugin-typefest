import type { AsyncFunction } from "type-fest";

export type Loader<Args extends readonly unknown[], Result> = (...args: Args) => Promise<Result>;

export type { AsyncFunction };
