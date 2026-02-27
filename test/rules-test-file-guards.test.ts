import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * Verifies every registered rule short-circuits in test-file paths.
 */
import { describe, expect, it, vi } from "vitest";

import typefestPlugin from "../src/plugin";

type GenericRuleModule = TSESLint.RuleModule<string, Readonly<UnknownArray>>;

const guardedRuleIds = [
    "prefer-ts-extras-array-at",
    "prefer-ts-extras-array-concat",
    "prefer-ts-extras-array-find",
    "prefer-ts-extras-array-find-last",
    "prefer-ts-extras-array-find-last-index",
    "prefer-ts-extras-array-first",
    "prefer-ts-extras-array-includes",
    "prefer-ts-extras-array-join",
    "prefer-ts-extras-array-last",
    "prefer-ts-extras-as-writable",
    "prefer-ts-extras-assert-defined",
    "prefer-ts-extras-assert-error",
    "prefer-ts-extras-assert-present",
    "prefer-ts-extras-is-defined",
    "prefer-ts-extras-is-defined-filter",
    "prefer-ts-extras-is-empty",
    "prefer-ts-extras-is-finite",
    "prefer-ts-extras-is-infinite",
    "prefer-ts-extras-is-integer",
    "prefer-ts-extras-is-present",
    "prefer-ts-extras-is-present-filter",
    "prefer-ts-extras-is-safe-integer",
    "prefer-ts-extras-key-in",
    "prefer-ts-extras-not",
    "prefer-ts-extras-object-entries",
    "prefer-ts-extras-object-from-entries",
    "prefer-ts-extras-object-has-in",
    "prefer-ts-extras-object-has-own",
    "prefer-ts-extras-object-keys",
    "prefer-ts-extras-object-values",
    "prefer-ts-extras-safe-cast-to",
    "prefer-ts-extras-set-has",
    "prefer-ts-extras-string-split",
    "prefer-type-fest-abstract-constructor",
    "prefer-type-fest-arrayable",
    "prefer-type-fest-async-return-type",
    "prefer-type-fest-conditional-pick",
    "prefer-type-fest-constructor",
    "prefer-type-fest-except",
    "prefer-type-fest-if",
    "prefer-type-fest-iterable-element",
    "prefer-type-fest-json-array",
    "prefer-type-fest-json-object",
    "prefer-type-fest-json-primitive",
    "prefer-type-fest-json-value",
    "prefer-type-fest-keys-of-union",
    "prefer-type-fest-literal-union",
    "prefer-type-fest-merge-exclusive",
    "prefer-type-fest-non-empty-tuple",
    "prefer-type-fest-omit-index-signature",
    "prefer-type-fest-partial-deep",
    "prefer-type-fest-primitive",
    "prefer-type-fest-promisable",
    "prefer-type-fest-readonly-deep",
    "prefer-type-fest-require-all-or-none",
    "prefer-type-fest-require-at-least-one",
    "prefer-type-fest-require-exactly-one",
    "prefer-type-fest-require-one-or-none",
    "prefer-type-fest-required-deep",
    "prefer-type-fest-schema",
    "prefer-type-fest-set-non-nullable",
    "prefer-type-fest-set-optional",
    "prefer-type-fest-set-readonly",
    "prefer-type-fest-set-required",
    "prefer-type-fest-simplify",
    "prefer-type-fest-tagged-brands",
    "prefer-type-fest-tuple-of",
    "prefer-type-fest-unknown-array",
    "prefer-type-fest-unknown-map",
    "prefer-type-fest-unknown-record",
    "prefer-type-fest-unknown-set",
    "prefer-type-fest-unwrap-tagged",
    "prefer-type-fest-value-of",
    "prefer-type-fest-writable",
    "prefer-type-fest-writable-deep",
] as const;

const createProgramNode = (): TSESTree.Program =>
    ({
        body: [],
        comments: [],
        range: [0, 0],
        sourceType: "module",
        tokens: [],
        type: "Program",
    }) as unknown as TSESTree.Program;

const createRuleContext = (): TSESLint.RuleContext<string, readonly []> =>
    ({
        filename: "src/example.test.ts",
        id: "typefest/test-file-guard-coverage",
        languageOptions: {
            parser: {
                meta: {
                    name: "@typescript-eslint/parser",
                },
            },
        },
        options: [],
        report: vi.fn<TSESLint.RuleContext<string, readonly []>["report"]>(),
        settings: {},
        sourceCode: {
            ast: createProgramNode(),
            getText: () => "",
        },
    }) as unknown as TSESLint.RuleContext<string, readonly []>;

describe("rule test-file guard coverage", () => {
    it("returns no listeners for every rule when filename is a test file", () => {
        for (const ruleId of guardedRuleIds) {
            const typedRuleModule = typefestPlugin.rules[
                ruleId
            ] as GenericRuleModule;
            const listeners = typedRuleModule.create(createRuleContext());

            expect(listeners).toBeTypeOf("object");
            expect(
                Object.keys(listeners),
                `${ruleId} should short-circuit`
            ).toHaveLength(0);
        }
    });
});
