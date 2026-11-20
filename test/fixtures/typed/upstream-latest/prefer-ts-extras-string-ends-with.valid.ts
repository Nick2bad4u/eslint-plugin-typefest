import { stringEndsWith } from "ts-extras";

declare const optional: string | undefined;
declare const wrapper: { value: string } | undefined;
declare const lookup: { endsWith(value: string): boolean };
declare const buildSearch: () => string;
declare const parameters: [string];
declare const values: string;

export const optionalResult: boolean | undefined = optional?.endsWith(".json");
export const optionalCall: boolean | undefined = values.endsWith?.(".json");
export const chainResult: boolean | undefined =
    wrapper?.value.endsWith(".json");
export const computedResult: boolean = values["endsWith"](".json");
export const helperResult: boolean = stringEndsWith(values, ".json");
export const spreadResult: boolean = values.endsWith(...parameters);
export const effectfulArgument: boolean = values.endsWith(buildSearch());
export const customLookup: boolean = lookup.endsWith(".json");
declare const boxed: String;
export const boxedResult: boolean = boxed.endsWith(".json");
