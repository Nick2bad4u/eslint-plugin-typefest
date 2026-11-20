import { isTruthy } from "ts-extras";

export function retainStrings(
    values: readonly (string | undefined)[]
): string[] {
    return values.filter(isTruthy);
}

export function retainLiterals(
    values: readonly (
        | false
        | 0
        | 0n
        | ""
        | "on"
        | 1
    )[]
): ("on" | 1)[] {
    return values.filter(isTruthy);
}
