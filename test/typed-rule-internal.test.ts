/**
 * @packageDocumentation
 * Vitest coverage for shared typed-rule internal helpers.
 */
import { describe, expect, it } from "vitest";

import { isTestFilePath } from "../src/_internal/typed-rule";

describe(isTestFilePath, () => {
    it("recognizes test-like paths while leaving non-test paths unmatched", () => {
        const testLikePaths = [
            "src/__tests__/value.ts",
            "tests/value.ts",
            "src/value.test.ts",
            "src/value.spec.tsx",
            "src/value.test.mts",
            "src/value.spec.cts",
        ] as const;

        for (const candidatePath of testLikePaths) {
            expect(isTestFilePath(candidatePath)).toBeTruthy();
        }

        expect(isTestFilePath("src/value.ts")).toBeFalsy();
    });
});
