import { mapHas } from "ts-extras";

declare const optional: ReadonlyMap<string, number> | undefined;
declare const wrapper: { value: ReadonlyMap<string, number> } | undefined;
declare const lookup: { has(value: string): boolean };
declare const buildSearch: () => string;
declare const parameters: [string];
declare const values: ReadonlyMap<string, number>;

export const optionalResult: boolean | undefined = optional?.has("ready");
export const optionalCall: boolean | undefined = values.has?.("ready");
export const chainResult: boolean | undefined = wrapper?.value.has("ready");
export const computedResult: boolean = values["has"]("ready");
export const helperResult: boolean = mapHas(values, "ready");
export const spreadResult: boolean = values.has(...parameters);
export const effectfulArgument: boolean = values.has(buildSearch());
export const customLookup: boolean = lookup.has("ready");
declare const weak: WeakMap<object, number>;
declare const set: Set<string>;
interface Map<Unrelated> extends ReadonlyMap<number, number> {
    tag: Unrelated;
}
declare const local: Map<string>;
export const weakResult: boolean = weak.has({});
export const setResult: boolean = set.has("ready");
export const localResult: boolean = local.has(1);
