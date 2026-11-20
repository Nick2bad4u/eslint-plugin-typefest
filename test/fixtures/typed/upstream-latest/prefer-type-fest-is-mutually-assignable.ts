import type { IsMutuallyAssignable } from "type-fest";

export type Compatible<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false;

export type { IsMutuallyAssignable };
