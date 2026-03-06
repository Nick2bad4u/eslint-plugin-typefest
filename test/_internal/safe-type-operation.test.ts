import { describe, expect, it } from "vitest";

import type { SafeTypeOperationFailureObserver } from "../../src/_internal/safe-type-operation";

import {
    registerSafeTypeOperationFailureObserver,
    safeTypeOperation,
    withSafeTypeOperationFailureObserver,
} from "../../src/_internal/safe-type-operation";

type TestFailurePayload = Readonly<{
    error: unknown;
    reason: string;
}>;

describe(safeTypeOperation, () => {
    it("returns successful result when operation does not throw", () => {
        const result = safeTypeOperation({
            operation: () => 42,
            reason: "noop",
        });

        expect(result.ok).toBeTruthy();
        expect(result).toStrictEqual({
            ok: true,
            value: 42,
        });
    });

    it("returns failure result and calls local observer when operation throws", () => {
        const observedFailures: TestFailurePayload[] = [];
        const operationError = new TypeError("boom");

        const result = safeTypeOperation({
            onFailure: (failure) => {
                observedFailures.push(failure);
            },
            operation: () => {
                throw operationError;
            },
            reason: "local-failure",
        });

        expect(result.ok).toBeFalsy();
        expect(result).toHaveProperty("failure.error", operationError);
        expect(result).toHaveProperty("failure.reason", "local-failure");
        expect(observedFailures).toHaveLength(1);
    });

    it("does not rethrow when local observer throws", () => {
        const result = safeTypeOperation({
            onFailure: () => {
                throw new Error("observer exploded");
            },
            operation: () => {
                throw new TypeError("operation exploded");
            },
            reason: "observer-throws",
        });

        expect(result.ok).toBeFalsy();
    });

    it("notifies registered global observers and supports unsubscribe", () => {
        const observedGlobalFailures: TestFailurePayload[] = [];

        const observer: SafeTypeOperationFailureObserver<string> = (
            failure
        ) => {
            observedGlobalFailures.push(failure);
        };

        const unsubscribe = registerSafeTypeOperationFailureObserver(observer);

        safeTypeOperation({
            operation: () => {
                throw new TypeError("first");
            },
            reason: "first-failure",
        });

        unsubscribe();

        safeTypeOperation({
            operation: () => {
                throw new TypeError("second");
            },
            reason: "second-failure",
        });

        expect(observedGlobalFailures).toHaveLength(1);
        expect(observedGlobalFailures[0]).toHaveProperty(
            "reason",
            "first-failure"
        );
    });

    it("does not rethrow when a global observer throws", () => {
        const throwingObserver: SafeTypeOperationFailureObserver<
            string
        > = () => {
            throw new Error("global observer exploded");
        };

        const unsubscribe =
            registerSafeTypeOperationFailureObserver(throwingObserver);

        try {
            const result = safeTypeOperation({
                operation: () => {
                    throw new TypeError("operation exploded");
                },
                reason: "global-observer-throws",
            });

            expect(result.ok).toBeFalsy();
        } finally {
            unsubscribe();
        }
    });

    it("withSafeTypeOperationFailureObserver unregisters observer after completion", () => {
        const observedFailures: TestFailurePayload[] = [];
        const observer: SafeTypeOperationFailureObserver<string> = (
            failure
        ) => {
            observedFailures.push(failure);
        };

        withSafeTypeOperationFailureObserver(observer, () => {
            safeTypeOperation({
                operation: () => {
                    throw new TypeError("first");
                },
                reason: "scoped-first-failure",
            });
        });

        safeTypeOperation({
            operation: () => {
                throw new TypeError("second");
            },
            reason: "scoped-second-failure",
        });

        expect(observedFailures).toHaveLength(1);
        expect(observedFailures[0]).toHaveProperty(
            "reason",
            "scoped-first-failure"
        );
    });

    it("withSafeTypeOperationFailureObserver unregisters observer when operation throws", () => {
        const observedFailures: TestFailurePayload[] = [];
        const observer: SafeTypeOperationFailureObserver<string> = (
            failure
        ) => {
            observedFailures.push(failure);
        };

        expect(() => {
            withSafeTypeOperationFailureObserver(observer, () => {
                safeTypeOperation({
                    operation: () => {
                        throw new TypeError("within-scoped-operation");
                    },
                    reason: "scoped-throws-first-failure",
                });

                throw new Error("expected scoped operation failure");
            });
        }).toThrowError("expected scoped operation failure");

        safeTypeOperation({
            operation: () => {
                throw new TypeError("after-scoped-operation");
            },
            reason: "scoped-throws-second-failure",
        });

        expect(observedFailures).toHaveLength(1);
        expect(observedFailures[0]).toHaveProperty(
            "reason",
            "scoped-throws-first-failure"
        );
    });
});
