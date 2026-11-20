declare const filename: string;

export const found: boolean = filename.startsWith("config-");
export const withOffset: boolean = filename.startsWith("config-", 1);
export const explicitUndefined: boolean = filename.startsWith(
    "config-",
    undefined
);
