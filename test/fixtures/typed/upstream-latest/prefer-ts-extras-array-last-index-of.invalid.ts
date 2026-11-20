declare const statuses: readonly ["ready", "idle"];

export const found: number = statuses.lastIndexOf("ready");
export const withOffset: number = statuses.lastIndexOf("ready", 1);
export const explicitUndefined: number = statuses.lastIndexOf(
    "ready",
    undefined
);
