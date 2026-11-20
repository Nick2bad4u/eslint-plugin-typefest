import { stringStartsWith } from "ts-extras";

declare const optional: string | undefined;
declare const wrapper: { value: string } | undefined;
declare const lookup: { startsWith(value: string): boolean };
declare const buildSearch: () => string;
declare const parameters: [string];
declare const values: string;

export const optionalResult: boolean | undefined =
    optional?.startsWith("config-");
export const optionalCall: boolean | undefined = values.startsWith?.("config-");
export const chainResult: boolean | undefined =
    wrapper?.value.startsWith("config-");
export const computedResult: boolean = values["startsWith"]("config-");
export const helperResult: boolean = stringStartsWith(values, "config-");
export const spreadResult: boolean = values.startsWith(...parameters);
export const effectfulArgument: boolean = values.startsWith(buildSearch());
export const customLookup: boolean = lookup.startsWith("config-");
const boxed: typeof String.prototype = Object("config-example.json");
export const boxedResult: boolean = boxed.startsWith("config-");
