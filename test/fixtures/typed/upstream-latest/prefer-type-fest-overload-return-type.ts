import type { Overloads as Signatures } from "type-fest";
import type * as TF from "type-fest";
import type { OverloadReturnType } from "type-fest";

declare function convert(value: string): number;
declare function convert(value: number): string;

export type Preferred = OverloadReturnType<typeof convert>;

export type Named = ReturnType<Signatures<typeof convert>[number]>;
export type Namespaced = ReturnType<TF.Overloads<typeof convert>[number]>;
