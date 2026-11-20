import type { OverloadReturnType, Overloads as Signatures } from "type-fest";

export declare function convert(value: string): number;
export declare function convert(value: number): string;

export type Preferred = OverloadReturnType<typeof convert>;
export type Named = ReturnType<Signatures<typeof convert>[number]>;
