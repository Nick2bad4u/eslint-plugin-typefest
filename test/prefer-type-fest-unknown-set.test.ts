/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unknown-set.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { describe, expect, it, vi } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-unknown-set");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-unknown-set.valid.ts";
const invalidFixtureName = "prefer-type-fest-unknown-set.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { UnknownSet } from "type-fest";\n${invalidFixtureCode.replace(
    "ReadonlySet<unknown>",
    "Readonly<UnknownSet>"
)}`;
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "ReadonlySet<unknown>",
    "Readonly<UnknownSet>"
);
const inlineInvalidSetCode = "type Input = Set<unknown>;";
const inlineInvalidReadonlySetCode = "type Input = ReadonlySet<unknown>;";
const inlineInvalidReadonlySetOutputCode = [
    'import type { UnknownSet } from "type-fest";',
    "type Input = Readonly<UnknownSet>;",
].join("\n");
const inlineValidSetCode = "type Input = Set<string>;";
const inlineValidReadonlySetCode = "type Input = ReadonlySet<number>;";
const inlineValidReadonlySetNoTypeArgumentsCode = "type Input = ReadonlySet;";
const inlineValidReadonlySetWrongArityCode =
    "type Input = ReadonlySet<unknown, unknown>;";
const inlineValidGlobalReadonlySetCode =
    "type Input = globalThis.ReadonlySet<unknown>;";
const inlineFixableCode = [
    'import type { UnknownSet } from "type-fest";',
    "",
    "type Input = ReadonlySet<unknown>;",
].join("\n");
const inlineFixableOutput = [
    'import type { UnknownSet } from "type-fest";',
    "",
    "type Input = Readonly<UnknownSet>;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-unknown-set",
    {
        docsDescription:
            "require TypeFest UnknownSet over ReadonlySet<unknown> aliases.",
        enforceRuleShape: true,
        messages: {
            preferUnknownSet:
                "Prefer `Readonly<UnknownSet>` from type-fest over `ReadonlySet<unknown>`.",
        },
    }
);

describe("prefer-type-fest-unknown-set source assertions", () => {
    it("matches ReadonlySet<unknown> in undecorated visitor", async () => {
        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: (): boolean => false,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-unknown-set")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            const parsedResult = parser.parseForESLint(
                "type Input = ReadonlySet<unknown>;",
                {
                    ecmaVersion: "latest",
                    loc: true,
                    range: true,
                    sourceType: "module",
                }
            );

            const [firstStatement] = parsedResult.ast.body;

            expect(firstStatement?.type).toBe("TSTypeAliasDeclaration");

            if (
                firstStatement?.type !== AST_NODE_TYPES.TSTypeAliasDeclaration
            ) {
                throw new Error("Expected a type alias declaration statement");
            }

            const aliasAnnotation = firstStatement.typeAnnotation;

            expect(aliasAnnotation.type).toBe("TSTypeReference");

            if (aliasAnnotation.type !== AST_NODE_TYPES.TSTypeReference) {
                throw new Error("Expected a type reference in the type alias");
            }

            const report = vi.fn();

            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-type-fest-unknown-set.invalid.ts",
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                },
            });

            listenerMap.TSTypeReference?.(aliasAnnotation);

            expect(report).toHaveBeenCalledTimes(1);
            expect(report).toHaveBeenCalledWith(
                expect.objectContaining({
                    messageId: "preferUnknownSet",
                    node: aliasAnnotation,
                })
            );
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run("prefer-type-fest-unknown-set", rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferUnknownSet",
                },
                {
                    messageId: "preferUnknownSet",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture UnknownSet aliases",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidReadonlySetCode,
            errors: [{ messageId: "preferUnknownSet" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports inline ReadonlySet<unknown> alias",
            output: inlineInvalidReadonlySetOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferUnknownSet" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes ReadonlySet<unknown> when UnknownSet import is in scope",
            output: inlineFixableOutput,
        },
    ],
    valid: [
        {
            code: inlineInvalidSetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable Set<unknown> alias",
        },
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidSetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable Set with concrete element type",
        },
        {
            code: inlineValidReadonlySetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlySet with concrete element type",
        },
        {
            code: inlineValidReadonlySetNoTypeArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlySet without type arguments",
        },
        {
            code: inlineValidReadonlySetWrongArityCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlySet with invalid generic arity",
        },
        {
            code: inlineValidGlobalReadonlySetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.ReadonlySet reference",
        },
    ],
});
