import { assert } from "ts-extras";

export function assertToken(token: string | undefined): asserts token {
    assert(token, "Token is required");
}

export function keepComputedMessage(
    ready: boolean,
    getMessage: () => string
): void {
    if (!ready) {
        throw new Error(getMessage());
    }
}

export function keepTypedError(ready: boolean): void {
    if (!ready) {
        throw new TypeError("Not ready");
    }
}
