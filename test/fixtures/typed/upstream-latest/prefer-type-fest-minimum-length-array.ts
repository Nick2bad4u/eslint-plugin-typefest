import type { MinimumLengthArray } from "type-fest";

export type Batch<T> = [T, T, ...T[]];

export type { MinimumLengthArray };
