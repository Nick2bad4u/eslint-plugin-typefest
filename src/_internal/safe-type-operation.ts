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
 * Shared observer set for operation failures across rule modules.
 *
 * @remarks
 * Observers are intentionally process-local and opt-in; they exist for
 * diagnostics and test instrumentation only.
 */
const safeTypeOperationFailureObservers = new Set<
    SafeTypeOperationFailureObserver<string>
>();

/**
 * Notify all registered global failure observers.
 *
 * @param failure - Failure payload emitted by a typed operation.
 */
const notifySafeTypeOperationFailureObservers = (
    failure: Readonly<SafeTypeOperationFailure<string>>
): void => {
    for (const observer of safeTypeOperationFailureObservers) {
        try {
            observer(failure);
        } catch {
            // Observer failures must never break lint execution.
        }
    }
};

/**
 * Register a process-local failure observer for typed operations.
 *
 * @param observer - Callback invoked for each operation failure.
 *
 * @returns Unsubscribe callback to remove the observer.
 */
export const registerSafeTypeOperationFailureObserver = (
    observer: SafeTypeOperationFailureObserver<string>
): (() => void) => {
    safeTypeOperationFailureObservers.add(observer);

    return () => {
        safeTypeOperationFailureObservers.delete(observer);
    };
};

/**
 * Run one operation with a scoped failure observer that is always cleaned up.
 *
 * @param observer - Observer registered for the operation scope.
 * @param operation - Synchronous operation to execute while observing failures.
 *
 * @returns Return value from {@link operation}.
 */
export const withSafeTypeOperationFailureObserver = <Result>(
    observer: SafeTypeOperationFailureObserver<string>,
    operation: () => Result
): Result => {
    const unsubscribe = registerSafeTypeOperationFailureObserver(observer);

    try {
        return operation();
    } finally {
        unsubscribe();
    }
};

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

        try {
            onFailure?.(failure);
        } catch {
            // Local observers are optional instrumentation; do not rethrow.
        }

        notifySafeTypeOperationFailureObservers(failure);

        return {
            failure,
            ok: false,
        };
    }
};

/**
 * Build a lightweight reason counter for debugging operation failures in tests.
 *
 * @param reasonsForTypeInference - Optional typed reason literals used to infer
 *   the `Reason` generic without requiring explicit type parameters.
 */
export const createSafeTypeOperationCounter = <Reason extends string = never>(
    reasonsForTypeInference: readonly Reason[] = []
): SafeTypeOperationCounter<Reason> => {
    const counts = new Map<Reason, number>();

    for (const reason of reasonsForTypeInference) {
        counts.set(reason, counts.get(reason) ?? 0);
    }

    const onFailure: SafeTypeOperationFailureObserver<Reason> = (failure) => {
        const previousCount = counts.get(failure.reason) ?? 0;
        counts.set(failure.reason, previousCount + 1);
    };

    return {
        getSnapshot: (): ReadonlyMap<Reason, number> => new Map(counts),
        onFailure,
    };
};
