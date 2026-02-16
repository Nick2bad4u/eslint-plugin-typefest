import fc from "fast-check";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

import {
    getSignatureParameterTypeAt,
    getTypedRuleServices,
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

interface ParserServicesLike {
    esTreeNodeToTSNodeMap: WeakMap<object, object>;
    program: null | ts.Program;
    tsNodeToESTreeNodeMap: WeakMap<object, object>;
}

const createTypedRuleContext = (parserServices: ParserServicesLike) => ({
    languageOptions: {
        parser: {
            meta: {
                name: "@typescript-eslint/parser",
            },
        },
    },
    sourceCode: {
        parserServices,
    },
});

const createParserServices = (
    program: null | ts.Program
): ParserServicesLike => ({
    esTreeNodeToTSNodeMap: new WeakMap<object, object>(),
    program,
    tsNodeToESTreeNodeMap: new WeakMap<object, object>(),
});

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

describe("getTypedRuleServices", () => {
    it("returns parser services and type checker when program is available", () => {
        const checker = {} as ts.TypeChecker;
        const parserServices = createParserServices({
            getTypeChecker: () => checker,
        } as ts.Program);

        const context = createTypedRuleContext(parserServices);

        const result = getTypedRuleServices(context as never);

        expect(result.parserServices).toBe(parserServices);
        expect(result.checker).toBe(checker);
    });

    it("throws when parser services do not expose a TypeScript program", () => {
        const parserServices = createParserServices(null);

        const context = createTypedRuleContext(parserServices);

        expect(() => getTypedRuleServices(context as never)).toThrowError(
            /requires parserServices\.program/v
        );
    });
});

describe("getSignatureParameterTypeAt", () => {
    const location = {} as ts.Node;

    it("returns undefined when the parameter index is out of range", () => {
        const checker = {
            getTypeOfSymbolAtLocation: vi.fn(),
        } as unknown as ts.TypeChecker;
        const signature = {
            parameters: [],
        } as unknown as ts.Signature;

        expect(
            getSignatureParameterTypeAt({
                checker,
                index: 0,
                location,
                signature,
            })
        ).toBeUndefined();
    });

    it("delegates to checker.getTypeOfSymbolAtLocation when parameter exists", () => {
        const parameter = {} as ts.Symbol;
        const signature = {
            parameters: [parameter],
        } as unknown as ts.Signature;
        const expectedType = {} as ts.Type;

        const checkerWithSpy = {
            getTypeOfSymbolAtLocation: vi.fn().mockReturnValue(expectedType),
        } as unknown as ts.TypeChecker;

        expect(
            getSignatureParameterTypeAt({
                checker: checkerWithSpy,
                index: 0,
                location,
                signature,
            })
        ).toBe(expectedType);
        expect(checkerWithSpy.getTypeOfSymbolAtLocation).toHaveBeenCalledWith(
            parameter,
            location
        );
    });
});
