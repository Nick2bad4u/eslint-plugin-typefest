import { hasAtLeast } from "ts-extras";

declare const items: readonly string[];

export const checked: boolean = items.length >= 2;
export const preferred: boolean = hasAtLeast(items, 2);

export function checkedItem(items: readonly string[]): string | undefined {
    if (hasAtLeast(items, 2)) {
        const item: string = items[1];
        return item;
    }
    return undefined;
}
