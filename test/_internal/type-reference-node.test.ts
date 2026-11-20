import {
    ESLintUtils,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { describe, expect, it } from "vitest";

import {
    isGlobalTypeReferenceNamed,
    isIdentifierTypeReference,
} from "../../src/_internal/type-reference-node";
import { createRuleTester } from "./ruleTester";

/** Contract tests for identifier-only `TSTypeReference` detection. */
describe(isIdentifierTypeReference, () => {
    it("returns true for matching identifier type references", () => {
        expect.hasAssertions();

        const node = {
            type: "TSTypeReference",
            typeName: {
                name: "Arrayable",
                type: "Identifier",
            },
        } as unknown as TSESTree.TypeNode;

        expect(isIdentifierTypeReference(node, "Arrayable")).toBe(true);
    });

    it("returns false for non-matching identifier names", () => {
        expect.hasAssertions();

        const node = {
            type: "TSTypeReference",
            typeName: {
                name: "Writable",
                type: "Identifier",
            },
        } as unknown as TSESTree.TypeNode;

        expect(isIdentifierTypeReference(node, "Arrayable")).toBe(false);
    });

    it("returns false for non-type-reference nodes", () => {
        expect.hasAssertions();

        const node = {
            type: "TSStringKeyword",
        } as unknown as TSESTree.TypeNode;

        expect(isIdentifierTypeReference(node, "Arrayable")).toBe(false);
    });
});

const globalTypeReferenceProbeRule = ESLintUtils.RuleCreator.withoutDocs<
    readonly [Readonly<{ typeName: string }>],
    "globalTypeReference"
>({
    create(context, [{ typeName }]) {
        return {
            TSTypeReference(node) {
                if (isGlobalTypeReferenceNamed(context, node, typeName)) {
                    context.report({ messageId: "globalTypeReference", node });
                }
            },
        };
    },
    defaultOptions: [{ typeName: "Omit" }],
    meta: {
        messages: {
            globalTypeReference: "References the global type.",
        },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    typeName: {
                        type: "string",
                    },
                },
                type: "object",
            },
        ],
        type: "problem",
    },
});

const scriptLanguageOptions = {
    parserOptions: {
        sourceType: "script",
    },
    sourceType: "script",
} as const;

/** Scope-resolution tests for global (built-in) type reference detection. */
createRuleTester().run(
    "isGlobalTypeReferenceNamed",
    globalTypeReferenceProbeRule,
    {
        invalid: [
            {
                code: 'type UserWithoutId = Omit<{ id: string }, "id">;',
                errors: [{ messageId: "globalTypeReference" }],
                name: "matches the built-in type when nothing shadows it",
            },
            {
                code: [
                    "const Omit = 1;",
                    'type UserWithoutId = Omit<{ id: string }, "id">;',
                ].join("\n"),
                errors: [{ line: 2, messageId: "globalTypeReference" }],
                name: "ignores value-only bindings with the same name",
            },
            {
                code: [
                    "namespace Local {",
                    "    type Omit<T, K extends PropertyKey> = T & Record<K, never>;",
                    '    export type Inner = Omit<{ id: string }, "id">;',
                    "}",
                    'type Outer = Omit<{ id: string }, "id">;',
                ].join("\n"),
                errors: [{ line: 5, messageId: "globalTypeReference" }],
                name: "applies a shadowing declaration only inside its own scope",
            },
            {
                code: [
                    "interface Array<T> {",
                    "    extra(): T;",
                    "}",
                    "type Values = Array<string>;",
                ].join("\n"),
                errors: [{ line: 4, messageId: "globalTypeReference" }],
                languageOptions: scriptLanguageOptions,
                name: "treats global interface merging as the built-in type",
                options: [{ typeName: "Array" }],
            },
        ],
        valid: [
            {
                code: [
                    "type Omit<T, K extends PropertyKey> = T & Record<K, never>;",
                    'type UserWithoutId = Omit<{ id: string }, "id">;',
                ].join("\n"),
                name: "ignores a type alias that shadows the built-in type",
            },
            {
                code: [
                    "interface ReadonlyArray<T> {",
                    "    readonly first: T;",
                    "}",
                    "type Values = ReadonlyArray<string>;",
                ].join("\n"),
                name: "ignores an interface that shadows the built-in type",
                options: [{ typeName: "ReadonlyArray" }],
            },
            {
                code: [
                    "class Promise<T> {",
                    "    value?: T;",
                    "}",
                    "type Pending = Promise<number>;",
                ].join("\n"),
                name: "ignores a class that shadows the built-in type",
                options: [{ typeName: "Promise" }],
            },
            {
                code: [
                    'import type { Record } from "./record";',
                    "type Values = Record<string, unknown>;",
                ].join("\n"),
                name: "ignores an import that shadows the built-in type",
                options: [{ typeName: "Record" }],
            },
            {
                code: "type Picked<Pick> = Pick;",
                name: "ignores a type parameter that shadows the built-in type",
                options: [{ typeName: "Pick" }],
            },
            {
                code: 'type Picked = Pick<{ id: string }, "id">;',
                name: "ignores references with a different name",
            },
        ],
    }
);

/** Failure-mode contract tests for global type reference detection. */
describe(isGlobalTypeReferenceNamed, () => {
    const omitReference = {
        type: "TSTypeReference",
        typeName: {
            name: "Omit",
            type: "Identifier",
        },
    } as unknown as TSESTree.TypeNode;

    it("returns false when scope resolution throws", () => {
        expect.hasAssertions();

        const context = {
            sourceCode: {
                getScope: () => {
                    throw new TypeError("scope failure");
                },
            },
        } as unknown as TSESLint.RuleContext<string, readonly unknown[]>;

        expect(isGlobalTypeReferenceNamed(context, omitReference, "Omit")).toBe(
            false
        );
    });

    it("treats references as global when scope lookup is unavailable", () => {
        expect.hasAssertions();

        const context = {
            sourceCode: {},
        } as unknown as TSESLint.RuleContext<string, readonly unknown[]>;

        expect(isGlobalTypeReferenceNamed(context, omitReference, "Omit")).toBe(
            true
        );
    });
});
