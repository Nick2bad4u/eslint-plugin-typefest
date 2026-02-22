import type { TSESTree } from "@typescript-eslint/utils";

import * as fs from "node:fs";
import { describe, expect, it, vi } from "vitest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-writable` behavior.
 */
import { getPluginRule, repoPath } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleName = "prefer-type-fest-writable";
const rule = getPluginRule(ruleName);
const ruleTester = createTypedRuleTester();

const mappedInvalidFixtureName = "prefer-type-fest-writable.invalid.ts";
const importedAliasInvalidFixtureName =
    "prefer-type-fest-writable-imported-alias.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { Mutable } from "type-aliases";',
    'import type { Writable } from "type-fest";',
    "",
    "type User = {",
    "    readonly id: string;",
    "};",
    "",
    "type MutableUser = Mutable<User>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type MutableUser = Mutable<User>;",
    "type MutableUser = Writable<User>;"
);
const mappedPKeyInvalidCode =
    "type WritableLike<T> = { -readonly [P in keyof T]: T[P] };";
const mappedWhitespaceVariantInvalidCode =
    "type WritableLike<T, U> = { -readonly [K in keyof (T & U)]: (T&U)[K] };";
const mappedNearMissReadonlyValidCode =
    "type WritableLike<T> = { readonly [K in keyof T]: T[K] };";
const mappedOptionalValidCode =
    "type WritableLike<T> = { -readonly [K in keyof T]?: T[K] };";
const mappedNameRemapValidCode =
    "type WritableLike<T> = { -readonly [K in keyof T as K]-?: T[K] };";
const mappedNameRemapWithoutOptionalValidCode =
    "type WritableLike<T> = { -readonly [K in keyof T as K]: T[K] };";
const mappedConstraintValidCode =
    "type WritableLike<T> = { -readonly [K in T]-?: T[K] };";
const mappedConstraintWithoutTypeOperatorValidCode =
    "type WritableLike<T> = { -readonly [K in T]: T[K] };";
const mappedReadonlyOperatorConstraintValidCode =
    "type WritableLike<T extends readonly unknown[]> = { -readonly [K in readonly T]: T[K] };";
const mappedNearMissIndexMismatchValidCode =
    "type WritableLike<T, P extends keyof T> = { -readonly [K in keyof T]: T[P] };";
const mappedLiteralIndexTypeValidCode =
    'type WritableLike<T extends { readonly id: string }> = { -readonly [K in keyof T]: T["id"] };';
const mappedNearMissObjectMismatchValidCode =
    "type WritableLike<T, U extends T> = { -readonly [K in keyof T]: U[K] };";
const mappedNonIndexedAccessValueValidCode =
    "type WritableLike<T> = { -readonly [K in keyof T]: K };";
const mappedNamespaceAliasValidCode = [
    'import type * as Aliases from "type-aliases";',
    "",
    "type User = {",
    "    readonly id: string;",
    "};",
    "",
    "type MutableUser = Aliases.Mutable<User>;",
].join("\n");
const skipPathInvalidCode =
    "type WritableLike<T> = { -readonly [K in keyof T]: T[K] };";
const validFixtureName = "prefer-type-fest-writable.valid.ts";

interface WritableRuleMetadataSnapshot {
    defaultOptions?: readonly unknown[];
    meta?: {
        docs?: {
            description?: string;
            url?: string;
        };
        messages?: Record<string, string>;
    };
    name?: string;
}

const loadWritableRuleMetadata = async (): Promise<
    WritableRuleMetadataSnapshot
> => {
    vi.resetModules();
    const moduleUnderTest = await import(
        "../src/rules/prefer-type-fest-writable.ts"
    );

    return moduleUnderTest.default as WritableRuleMetadataSnapshot;
};

type WritableMappedTypeNode = TSESTree.TSMappedType;
type WritableRuleCreateContext = Parameters<(typeof rule)["create"]>[0];

const createWritableMappedTypeNode = ({
    constraint,
    key,
    valueTypeAnnotation,
}: {
    constraint: WritableMappedTypeNode["constraint"];
    key: WritableMappedTypeNode["key"];
    valueTypeAnnotation: WritableMappedTypeNode["typeAnnotation"];
}): WritableMappedTypeNode =>
    ({
        constraint,
        key,
        nameType: null,
        optional: false,
        readonly: "-",
        type: "TSMappedType",
        typeAnnotation: valueTypeAnnotation,
    }) as unknown as WritableMappedTypeNode;

const createWritableMappedTypeListenerHarness = ({
    getText,
}: {
    getText: (node: unknown) => string;
}): {
    mappedTypeListener: (node: WritableMappedTypeNode) => void;
    report: ReturnType<typeof vi.fn>;
} => {
    const report = vi.fn();
    const sourceCode = {
        ast: {
            body: [],
        },
        getText,
    } as unknown as WritableRuleCreateContext["sourceCode"];
    const context = {
        filename: "src/writable-guard.ts",
        report,
        sourceCode,
    } as unknown as WritableRuleCreateContext;
    const listeners = rule.create(context) as Partial<
        Record<"TSMappedType", (node: WritableMappedTypeNode) => void>
    >;

    const mappedTypeListener = listeners.TSMappedType;
    if (!mappedTypeListener) {
        throw new Error("Expected TSMappedType listener to be defined");
    }

    return {
        mappedTypeListener,
        report,
    };
};

const createWritableIndexedAccessType = ({
    indexIdentifierName,
    objectType,
}: {
    indexIdentifierName: string;
    objectType: TSESTree.TypeNode;
}): TSESTree.TSIndexedAccessType =>
    ({
        indexType: {
            type: "TSTypeReference",
            typeName: {
                name: indexIdentifierName,
                type: "Identifier",
            },
        },
        objectType,
        type: "TSIndexedAccessType",
    }) as unknown as TSESTree.TSIndexedAccessType;

describe(ruleName, () => {
    it("exports expected metadata", async () => {
        const metadataRule = await loadWritableRuleMetadata();
        const metadataDefaultOptions =
            "defaultOptions" in metadataRule
                ? (metadataRule as { defaultOptions?: unknown }).defaultOptions
                : undefined;

        expect(metadataRule.name).toBe("prefer-type-fest-writable");
        expect(metadataDefaultOptions).toStrictEqual([]);
        expect(metadataRule.meta?.docs?.description).toBe(
            "require TypeFest Writable over manual mapped types that strip readonly with -readonly."
        );
        expect(metadataRule.meta?.docs?.url).toBe(
            "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-writable.md"
        );
        expect(rule.meta?.docs?.url).toBe(
            "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-writable.md"
        );
        expect(metadataRule.meta?.messages?.["preferWritable"]).toBe(
            "Prefer `Writable<T>` from type-fest over `{-readonly [K in keyof T]: T[K]}`."
        );
        expect(metadataRule.meta?.messages?.["preferWritableAlias"]).toBe(
            "Prefer `{{replacement}}` from type-fest over `{{alias}}`."
        );

        const writableRuleSource = fs.readFileSync(
            repoPath("src", "rules", "prefer-type-fest-writable.ts"),
            "utf8"
        );

        expect(writableRuleSource).toMatch(/prefer-type-fest-writable\.md/u);
    });

    it("declares authored docs url literal before RuleCreator decoration", async () => {
        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: () => false,
            }));

            const undecoratedModule =
                (await import("../src/rules/prefer-type-fest-writable.ts")) as {
                    default: WritableRuleMetadataSnapshot;
                };

            expect(undecoratedModule.default.meta?.docs?.url).toBe(
                "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-writable.md"
            );
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("does not throw when mapped constraint is missing", () => {
        const baseTypeNode = {
            type: "TSTypeReference",
        } as unknown as TSESTree.TypeNode;
        const mappedTypeNode = createWritableMappedTypeNode({
            constraint: undefined as unknown as WritableMappedTypeNode["constraint"],
            key: {
                name: "K",
                type: "Identifier",
            } as unknown as WritableMappedTypeNode["key"],
            valueTypeAnnotation: createWritableIndexedAccessType({
                indexIdentifierName: "K",
                objectType: baseTypeNode,
            }),
        });
        const { mappedTypeListener, report } =
            createWritableMappedTypeListenerHarness({
                getText: () => "T",
            });

        expect(() => {
            mappedTypeListener(mappedTypeNode);
        }).not.toThrowError();

        expect(report).not.toHaveBeenCalled();
    });

    it("ignores mapped nodes with missing base type annotation", () => {
        const mappedTypeNode = createWritableMappedTypeNode({
            constraint: {
                operator: "keyof",
                type: "TSTypeOperator",
            } as unknown as TSESTree.TSTypeOperator,
            key: {
                name: "K",
                type: "Identifier",
            } as unknown as WritableMappedTypeNode["key"],
            valueTypeAnnotation: createWritableIndexedAccessType({
                indexIdentifierName: "K",
                objectType: {
                    type: "TSTypeReference",
                } as unknown as TSESTree.TypeNode,
            }),
        });
        const { mappedTypeListener, report } =
            createWritableMappedTypeListenerHarness({
                getText: () => "T",
            });

        mappedTypeListener(mappedTypeNode);

        expect(report).not.toHaveBeenCalled();
    });

    it("ignores mapped nodes when key is not an identifier", () => {
        const baseTypeNode = {
            type: "TSTypeReference",
        } as unknown as TSESTree.TypeNode;
        const mappedTypeNode = createWritableMappedTypeNode({
            constraint: {
                operator: "keyof",
                type: "TSTypeOperator",
                typeAnnotation: baseTypeNode,
            } as unknown as TSESTree.TSTypeOperator,
            key: {
                name: "K",
                type: "Literal",
                value: "K",
            } as unknown as WritableMappedTypeNode["key"],
            valueTypeAnnotation: createWritableIndexedAccessType({
                indexIdentifierName: "K",
                objectType: baseTypeNode,
            }),
        });
        const { mappedTypeListener, report } =
            createWritableMappedTypeListenerHarness({
                getText: () => "T",
            });

        mappedTypeListener(mappedTypeNode);

        expect(report).not.toHaveBeenCalled();
    });

    it("normalizes type text using collapsed whitespace regex", () => {
        const baseTypeNode = {
            type: "TSTypeReference",
        } as unknown as TSESTree.TypeNode;
        const mappedTypeNode = createWritableMappedTypeNode({
            constraint: {
                operator: "keyof",
                type: "TSTypeOperator",
                typeAnnotation: baseTypeNode,
            } as unknown as TSESTree.TSTypeOperator,
            key: {
                name: "K",
                type: "Identifier",
            } as unknown as WritableMappedTypeNode["key"],
            valueTypeAnnotation: createWritableIndexedAccessType({
                indexIdentifierName: "K",
                objectType: baseTypeNode,
            }),
        });
        const replaceAllSpy = vi.spyOn(String.prototype, "replaceAll");
        const { mappedTypeListener, report } =
            createWritableMappedTypeListenerHarness({
                getText: () => "T  \n\tU",
            });

        try {
            mappedTypeListener(mappedTypeNode);

            const regexPatternCall = replaceAllSpy.mock.calls.find(
                ([pattern]) => pattern instanceof RegExp
            );

            expect(regexPatternCall).toBeDefined();

            if (!regexPatternCall) {
                return;
            }

            const [pattern, replacement] = regexPatternCall;
            if (!(pattern instanceof RegExp)) {
                throw new TypeError("Expected RegExp pattern call");
            }

            expect(pattern.source).toBe(String.raw`\s+`);
            expect(pattern.flags.includes("g")).toBeTruthy();
            expect(replacement).toBe("");

            expect(report).toHaveBeenCalledTimes(1);
        } finally {
            replaceAllSpy.mockRestore();
        }
    });
});

ruleTester.run(ruleName, rule, {
    invalid: [
        {
            code: readTypedFixture(importedAliasInvalidFixtureName),
            errors: [
                {
                    data: {
                        alias: "Mutable",
                        replacement: "Writable",
                    },
                    messageId: "preferWritableAlias",
                },
            ],
            filename: typedFixturePath(importedAliasInvalidFixtureName),
            name: "reports fixture imported Mutable alias usage",
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "Mutable",
                        replacement: "Writable",
                    },
                    messageId: "preferWritableAlias",
                },
            ],
            filename: typedFixturePath(importedAliasInvalidFixtureName),
            name: "reports and autofixes inline Mutable alias import",
            output: inlineFixableOutputCode,
        },
        {
            code: readTypedFixture(mappedInvalidFixtureName),
            errors: [
                { messageId: "preferWritable" },
                { messageId: "preferWritable" },
            ],
            filename: typedFixturePath(mappedInvalidFixtureName),
            name: "reports fixture readonly mapped type aliases",
        },
        {
            code: mappedPKeyInvalidCode,
            errors: [{ messageId: "preferWritable" }],
            filename: typedFixturePath(mappedInvalidFixtureName),
            name: "reports mapped type using P key identifier",
        },
        {
            code: mappedWhitespaceVariantInvalidCode,
            errors: [{ messageId: "preferWritable" }],
            filename: typedFixturePath(mappedInvalidFixtureName),
            name: "reports mapped type when base and indexed object text differ only by whitespace",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: mappedNearMissReadonlyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type that retains readonly modifier",
        },
        {
            code: mappedOptionalValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type that preserves optional modifier",
        },
        {
            code: mappedNameRemapValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with key remapping and optional removal",
        },
        {
            code: mappedNameRemapWithoutOptionalValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with key remapping only",
        },
        {
            code: mappedConstraintValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with custom key constraint and optional removal",
        },
        {
            code: mappedConstraintWithoutTypeOperatorValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with custom key constraint",
        },
        {
            code: mappedReadonlyOperatorConstraintValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with readonly key constraint operator",
        },
        {
            code: mappedNearMissIndexMismatchValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with mismatched indexed access key",
        },
        {
            code: mappedLiteralIndexTypeValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with literal indexed access value",
        },
        {
            code: mappedNearMissObjectMismatchValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type using alternate object source",
        },
        {
            code: mappedNonIndexedAccessValueValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mapped type with non-indexed value expression",
        },
        {
            code: mappedNamespaceAliasValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores namespace-qualified Mutable alias reference",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-writable.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
