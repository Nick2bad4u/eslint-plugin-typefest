declare const filename: string;

export const found: boolean = filename.endsWith(".json");
export const withOffset: boolean = filename.endsWith(".json", 1);
export const explicitUndefined: boolean = filename.endsWith(".json", undefined);
