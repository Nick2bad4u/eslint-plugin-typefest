/**
 * @packageDocumentation
 * Structured error handling for best-effort typed AST operations.
 */

/**
 * Counter contract used by test-time debug instrumentation.
 */
export type SafeTypeOperationCounter<Reason extends string> = Readonly<{
    getSnapshot: () => ReadonlyMap<Reason, number>;
    onFailure: (
        failure: Readonly<{
            error: unknown;
            reason: Reason;
        }>
    ) => void;
}>;

/**
 * Failure payload emitted when a safe typed operation throws.
 */
export type SafeTypeOperationFailure<Reason extends string> = Readonly<{
    error: unknown;
    reason: Reason;
}>;

/**
 * Optional observer called whenever an operation fails.
 */
export type SafeTypeOperationFailureObserver<Reason extends string> = (
    failure: Readonly<SafeTypeOperationFailure<Reason>>
) => void;

/**
 * Result shape for safe typed operations.
 */
export type SafeTypeOperationResult<Result, Reason extends string> =
    | Readonly<{
          failure: SafeTypeOperationFailure<Reason>;
          ok: false;
      }>
    | Readonly<{
          ok: true;
          value: Result;
      }>;

/**
 * Execute a typed operation with structured failure output instead of throws.
 */
export const safeTypeOperation = <Result, Reason extends string>({
    onFailure,
    operation,
    reason,
}: Readonly<{
    onFailure?: SafeTypeOperationFailureObserver<Reason>;
    operation: () => Result;
    reason: Reason;
}>): SafeTypeOperationResult<Result, Reason> => {
    try {
        return {
            ok: true,
            value: operation(),
        };
    } catch (error: unknown) {
        const failure: SafeTypeOperationFailure<Reason> = {
            error,
            reason,
        };

        onFailure?.(failure);

        return {
            failure,
            ok: false,
        };
    }
};

/**
 * Build a lightweight reason counter for debugging operation failures in tests.
 */
export const createSafeTypeOperationCounter = <Reason extends string>(
    reasonsForTypeInference: readonly Reason[] = []
): SafeTypeOperationCounter<Reason> => {
    if (reasonsForTypeInference.length > 0) {
        // Keep the optional argument observable for type inference only.
    }

    const counts = new Map<Reason, number>();

    const onFailure: SafeTypeOperationFailureObserver<Reason> = (failure) => {
        const previousCount = counts.get(failure.reason) ?? 0;
        counts.set(failure.reason, previousCount + 1);
    };

    return {
        getSnapshot: (): ReadonlyMap<Reason, number> => new Map(counts),
        onFailure,
    };
};
