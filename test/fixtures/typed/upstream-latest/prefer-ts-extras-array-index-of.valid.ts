import { arrayIndexOf } from "ts-extras";

declare const optional: readonly string[] | undefined;
declare const wrapper: { value: readonly string[] } | undefined;
declare const lookup: { indexOf(value: string): boolean };
declare const buildSearch: () => string;
declare const parameters: [string];
declare const values: readonly string[];

export const optionalResult: number | undefined = optional?.indexOf("ready");
export const optionalCall: number | undefined = values.indexOf?.("ready");
export const chainResult: number | undefined = wrapper?.value.indexOf("ready");
export const computedResult: number = values["indexOf"]("ready");
export const helperResult: number = arrayIndexOf(values, "ready");
export const spreadResult: number = values.indexOf(...parameters);
export const effectfulArgument: number = values.indexOf(buildSearch());
export const customLookup: boolean = lookup.indexOf("ready");
declare const text: string;
declare const typed: Uint8Array;
class CustomSearch extends Array<string> {
    override indexOf(value: string): number {
        return value.length;
    }
}
export const textResult: number = text.indexOf("ready");
export const typedResult: number = typed.indexOf(2);
export const customResult: number = new CustomSearch().indexOf("ready");
