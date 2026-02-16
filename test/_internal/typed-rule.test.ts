import fc from "fast-check";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

import {
    isTestFilePath,
    isTypeAssignableTo,
} from "../../src/_internal/typed-rule";

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

const assertKnownSuffixesProperty = (): void => {
    fc.assert(
        fc.property(
            fc.string({ maxLength: 32 }),
            fc.constantFrom(...knownTestSuffixes),
            (rawPrefix, suffix) => {
                const safePrefix = rawPrefix
                    .replaceAll("/", "_")
                    .replaceAll("\\", "_");
                const candidatePath = `${safePrefix.toUpperCase()}${suffix.toUpperCase()}`;

                expect(isTestFilePath(candidatePath)).toBe(true);
            }
        )
    );
};

const assertTestsDirectoryProperty = (): void => {
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

                expect(isTestFilePath(testsPath)).toBe(true);
                expect(isTestFilePath(underscoreTestsPath)).toBe(true);
            }
        )
    );
};

const assertNonTestPaths = (): void => {
    expect(isTestFilePath("src/rules/prefer-type-fest-json-value.ts")).toBe(
        false
    );
    expect(isTestFilePath("src/_internal/typed-rule.ts")).toBe(false);
    expect(isTestFilePath("docs/rules/prefer-type-fest-json-array.md")).toBe(
        false
    );
    expect(isTestFilePath("src/tests-helper.ts")).toBe(false);
};

describe("isTestFilePath", () => {
    it("accepts known test suffixes regardless of filename casing", () => {
        assertKnownSuffixesProperty();
    });

    it("accepts paths containing tests directories with mixed separators/casing", () => {
        assertTestsDirectoryProperty();
    });

    it("rejects non-test paths", () => {
        assertNonTestPaths();
    });
});

describe("isTypeAssignableTo", () => {
    const sourceType = {} as ts.Type;
    const targetType = {} as ts.Type;

    it("uses checker.isTypeAssignableTo when available", () => {
        const isTypeAssignableToMock = vi
            .fn<(source: ts.Type, target: ts.Type) => boolean>()
            .mockReturnValue(true);

        const checker = {
            isTypeAssignableTo: isTypeAssignableToMock,
        } as unknown as ts.TypeChecker;

        expect(isTypeAssignableTo(checker, sourceType, targetType)).toBe(true);
        expect(isTypeAssignableToMock).toHaveBeenCalledWith(
            sourceType,
            targetType
        );
    });

    it("falls back to typeToString equality when native assignability API is unavailable", () => {
        const typeToStringMock = vi
            .fn<(type: ts.Type) => string>()
            .mockReturnValue("shared");

        const checker = {
            typeToString: typeToStringMock,
        } as unknown as ts.TypeChecker;

        expect(isTypeAssignableTo(checker, sourceType, targetType)).toBe(true);
        expect(typeToStringMock).toHaveBeenCalledWith(sourceType);
        expect(typeToStringMock).toHaveBeenCalledWith(targetType);
    });

    it("returns false when typeToString fallback values differ", () => {
        const typeToStringMock = vi
            .fn<(type: ts.Type) => string>()
            .mockImplementation((type) =>
                type === sourceType ? "source" : "target"
            );

        const checker = {
            typeToString: typeToStringMock,
        } as unknown as ts.TypeChecker;

        expect(isTypeAssignableTo(checker, sourceType, targetType)).toBe(false);
    });
});
