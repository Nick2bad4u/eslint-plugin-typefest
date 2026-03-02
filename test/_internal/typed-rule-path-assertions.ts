/**
 * @packageDocumentation
 * Shared path-oriented assertions for typed-rule helper tests.
 */
import fc from "fast-check";
import { expect } from "vitest";

import { isTestFilePath } from "../../src/_internal/typed-rule";

const knownTestSuffixes = [
    ".spec.cts",
    ".spec.js",
    ".spec.jsx",
    ".spec.mts",
    ".spec.ts",
    ".spec.tsx",
    ".test.cts",
    ".test.js",
    ".test.jsx",
    ".test.mts",
    ".test.ts",
    ".test.tsx",
] as const;

export const assertKnownSuffixesProperty = (): void => {
    fc.assert(
        fc.property(
            fc.string({ maxLength: 32 }),
            fc.constantFrom(...knownTestSuffixes),
            (rawPrefix, suffix) => {
                const safePrefix = rawPrefix
                    .replaceAll("/", "_")
                    .replaceAll("\\", "_");
                const candidatePath = `${safePrefix.toUpperCase()}${suffix.toUpperCase()}`;

                expect(isTestFilePath(candidatePath)).toBeTruthy();
            }
        )
    );
};

export const assertTestsDirectoryProperty = (): void => {
    fc.assert(
        fc.property(
            fc.array(fc.string({ maxLength: 12 }), {
                maxLength: 3,
                minLength: 1,
            }),
            (rawSegments) => {
                const sanitizedSegments = rawSegments.map((segment) =>
                    segment
                        .replaceAll("/", "_")
                        .replaceAll("\\", "_")
                        .replaceAll(":", "_")
                );

                const prefix = sanitizedSegments.join("\\");
                const testsPath = String.raw`${prefix}\TeStS\file.ts`;
                const underscoreTestsPath = `${prefix}/__TeStS__/file.ts`;

                expect(isTestFilePath(testsPath)).toBeTruthy();
                expect(isTestFilePath(underscoreTestsPath)).toBeTruthy();
            }
        )
    );
};

export const assertNonTestPaths = (): void => {
    expect(
        isTestFilePath("src/rules/prefer-type-fest-json-value.ts")
    ).toBeFalsy();
    expect(isTestFilePath("src/_internal/typed-rule.ts")).toBeFalsy();
    expect(
        isTestFilePath("docs/rules/prefer-type-fest-json-array.md")
    ).toBeFalsy();
    expect(isTestFilePath("src/tests-helper.ts")).toBeFalsy();
};
