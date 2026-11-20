import { arrayLastIndexOf } from "ts-extras";

declare const optional: readonly string[] | undefined;
declare const wrapper: { value: readonly string[] } | undefined;
declare const lookup: { lastIndexOf(value: string): boolean };
declare const buildSearch: () => string;
declare const parameters: [string];
declare const values: readonly string[];

export const optionalResult: number | undefined =
    optional?.lastIndexOf("ready");
export const optionalCall: number | undefined = values.lastIndexOf?.("ready");
export const chainResult: number | undefined =
    wrapper?.value.lastIndexOf("ready");
export const computedResult: number = values["lastIndexOf"]("ready");
export const helperResult: number = arrayLastIndexOf(values, "ready");
export const spreadResult: number = values.lastIndexOf(...parameters);
export const effectfulArgument: number = values.lastIndexOf(buildSearch());
export const customLookup: boolean = lookup.lastIndexOf("ready");
declare const text: string;
declare const typed: Uint8Array;
class CustomSearch extends Array<string> {
    override lastIndexOf(value: string): number {
        return value.length;
    }
}
export const textResult: number = text.lastIndexOf("ready");
export const typedResult: number = typed.lastIndexOf(2);
export const customResult: number = new CustomSearch().lastIndexOf("ready");
