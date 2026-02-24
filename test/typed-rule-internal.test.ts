/**
 * @packageDocumentation
 * Vitest coverage for shared typed-rule internal helpers.
 */
import { describe, expect, it } from "vitest";

import { isTestFilePath } from "../src/_internal/typed-rule";

describe(isTestFilePath, () => {
    it("never skips files based on test-like paths", () => {
        const candidatePaths = [
            "src/value.ts",
            "src/__tests__/value.ts",
            "tests/value.ts",
            "src/value.test.ts",
            "src/value.spec.tsx",
            "src/value.test.mts",
            "src/value.spec.cts",
        ] as const;

        for (const candidatePath of candidatePaths) {
            expect(isTestFilePath(candidatePath)).toBeFalsy();
        }
    });
});
