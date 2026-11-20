import type { Falsy, Truthy } from "type-fest";

export type Clean<T> = NonNullable<Exclude<T, Falsy | void>>;

export type { Falsy, Truthy };
