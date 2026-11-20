import type {
    FunctionParameters as Args,
    OverloadParameters,
    Overloads as Signatures,
} from "type-fest";

export declare function convert(value: string): number;
export declare function convert(value: number): string;

export type Preferred = OverloadParameters<typeof convert>;
export type Named = Args<Signatures<typeof convert>[number]>;
