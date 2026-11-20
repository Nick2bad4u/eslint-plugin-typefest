declare const statusLabels: ReadonlyMap<string, number>;

export const found: boolean = statusLabels.has("ready");
declare const key: string;
export const present: boolean = statusLabels.has(key);
