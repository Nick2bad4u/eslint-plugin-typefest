export function assertToken(token: string | undefined): asserts token {
    if (!token) {
        throw new Error("Token is required");
    }
}

export function assertReady(ready: boolean): asserts ready {
    if (!ready) throw new Error();
}
