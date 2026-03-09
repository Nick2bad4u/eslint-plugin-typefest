import type { MockOptions } from "vitest";

export type CreateTypedRuleSelectorAwarePassThrough =
    (typeof import("../../src/_internal/typed-rule.js"))["createTypedRule"];

declare module "vitest" {
    interface VitestUtils {
        /**
         * Support test harness patterns using `vi.doMock(import(...), factory)`
         * with intentionally partial module mocks.
         */
        doMock(
            module: Promise<unknown>,
            factory?:
                | ((...arguments_: readonly unknown[]) => unknown)
                | MockOptions
        ): void;
    }
}

declare global {
    const createTypedRuleSelectorAwarePassThrough: CreateTypedRuleSelectorAwarePassThrough;
}
