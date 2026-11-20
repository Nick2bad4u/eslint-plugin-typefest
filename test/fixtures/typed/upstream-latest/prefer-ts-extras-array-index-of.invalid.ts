declare const statuses: readonly ["ready", "idle"];

export const found: number = statuses.indexOf("ready");
export const withOffset: number = statuses.indexOf("ready", 1);
export const explicitUndefined: number = statuses.indexOf("ready", undefined);
