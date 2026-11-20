import { isNonEmpty } from "ts-extras";

declare const items: readonly string[];

export const checked: boolean = items.length > 0;
export const preferred: boolean = isNonEmpty(items);

export function checkedLength(pair: [string?, number?] | [true, true]): number {
    if (pair.length !== 0) {
        const size: 1 | 2 = pair.length;
        return size;
    }
    const size: 0 = pair.length;
    return size;
}

export function checkedItem(items: readonly string[]): string | undefined {
    if (isNonEmpty(items)) {
        const item: string = items[0];
        return item;
    }
    return undefined;
}
