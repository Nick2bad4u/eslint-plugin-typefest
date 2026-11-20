import type {
    FunctionParameters as Args,
    Overloads as Signatures,
} from "type-fest";
import type * as TF from "type-fest";
import type { OverloadParameters } from "type-fest";

declare function convert(value: string): number;
declare function convert(value: number): string;

export type Preferred = OverloadParameters<typeof convert>;

export type Named = Args<Signatures<typeof convert>[number]>;
export type All = TF.FunctionParameters<TF.Overloads<typeof convert>[number]>;
