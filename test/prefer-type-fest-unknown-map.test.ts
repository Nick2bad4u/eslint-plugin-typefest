/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unknown-map.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { expect, test, vi } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-unknown-map");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-unknown-map.valid.ts";
const invalidFixtureName = "prefer-type-fest-unknown-map.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { UnknownMap } from "type-fest";\n${invalidFixtureCode.replace(
    "ReadonlyMap<unknown, unknown>",
    "UnknownMap"
)}`;
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "ReadonlyMap<unknown, unknown>",
    "UnknownMap"
);
const inlineInvalidMapCode = "type Input = Map<unknown, unknown>;";
const inlineInvalidReadonlyMapCode =
    "type Input = ReadonlyMap<unknown, unknown>;";
const inlineInvalidReadonlyMapOutputCode = [
    'import type { UnknownMap } from "type-fest";',
    "type Input = UnknownMap;",
].join("\n");
const inlineValidMixedMapCode = "type Input = Map<string, unknown>;";
const inlineValidMixedReadonlyMapCode =
    "type Input = ReadonlyMap<unknown, string>;";
const inlineValidReadonlyMapWithUnknownValueCode =
    "type Input = ReadonlyMap<string, unknown>;";
const inlineValidReadonlyMapNoTypeArgumentsCode = "type Input = ReadonlyMap;";
const inlineValidReadonlyMapWrongArityCode =
    "type Input = ReadonlyMap<unknown, unknown, unknown>;";
const inlineValidGlobalReadonlyMapCode =
    "type Input = globalThis.ReadonlyMap<unknown, unknown>;";
const skipPathInvalidCode = inlineInvalidReadonlyMapCode;
const inlineFixableCode = [
    'import type { UnknownMap } from "type-fest";',
    "",
    "type Input = ReadonlyMap<unknown, unknown>;",
].join("\n");
const inlineFixableOutput = [
    'import type { UnknownMap } from "type-fest";',
    "",
    "type Input = UnknownMap;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests("prefer-type-fest-unknown-map", {
    docsDescription:
        "require TypeFest UnknownMap over ReadonlyMap<unknown, unknown> aliases.",
    enforceRuleShape: true,
    messages: {
        preferUnknownMap:
            "Prefer `UnknownMap` from type-fest over `ReadonlyMap<unknown, unknown>`.",
    },
});

test("matches only ReadonlyMap<unknown, unknown> in undecorated visitor", async () => {
    try {
        vi.resetModules();

        vi.doMock("../src/_internal/typed-rule.js", () => ({
            createTypedRule: (definition: unknown): unknown => definition,
            isTestFilePath: (): boolean => false,
        }));

        const undecoratedRuleModule = (await import(
            "../src/rules/prefer-type-fest-unknown-map.ts"
        )) as {
            default: {
                create: (context: unknown) => {
                    TSTypeReference?: (node: unknown) => void;
                };
            };
        };

        const parsedResult = parser.parseForESLint(
            [
                "type Reported = ReadonlyMap<unknown, unknown>;",
                "type Ignored = ReadonlyMap<string, unknown>;",
            ].join("\n"),
            {
                ecmaVersion: "latest",
                loc: true,
                range: true,
                sourceType: "module",
            }
        );

        const [reportedAlias, ignoredAlias] = parsedResult.ast.body;

        if (
            reportedAlias?.type !== "TSTypeAliasDeclaration" ||
            ignoredAlias?.type !== "TSTypeAliasDeclaration"
        ) {
            throw new Error("Expected two type alias declarations in AST");
        }

        const reportedTypeReference = reportedAlias.typeAnnotation;
        const ignoredTypeReference = ignoredAlias.typeAnnotation;

        if (
            reportedTypeReference.type !== "TSTypeReference" ||
            ignoredTypeReference.type !== "TSTypeReference"
        ) {
            throw new Error("Expected type alias annotations to be type references");
        }

        const report = vi.fn();

        const listenerMap = undecoratedRuleModule.default.create({
            filename: "fixtures/typed/prefer-type-fest-unknown-map.invalid.ts",
            report,
            sourceCode: {
                ast: parsedResult.ast,
            },
        });

        listenerMap.TSTypeReference?.(reportedTypeReference);
        listenerMap.TSTypeReference?.(ignoredTypeReference);

        expect(report).toHaveBeenCalledTimes(1);
        expect(report).toHaveBeenCalledWith(
            expect.objectContaining({
                messageId: "preferUnknownMap",
                node: reportedTypeReference,
            })
        );
    } finally {
        vi.doUnmock("../src/_internal/typed-rule.js");
        vi.resetModules();
    }
});

ruleTester.run("prefer-type-fest-unknown-map", rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferUnknownMap",
                },
                {
                    messageId: "preferUnknownMap",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture UnknownMap aliases",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidReadonlyMapCode,
            errors: [{ messageId: "preferUnknownMap" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly unknown map shorthand",
            output: inlineInvalidReadonlyMapOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferUnknownMap" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes ReadonlyMap<unknown, unknown> when UnknownMap import is in scope",
            output: inlineFixableOutput,
        },
    ],
    valid: [
        {
            code: inlineInvalidMapCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable unknown map shorthand alias",
        },
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidMixedMapCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable unknown map alias",
        },
        {
            code: inlineValidMixedReadonlyMapCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly map with mismatched value type",
        },
        {
            code: inlineValidReadonlyMapWithUnknownValueCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly map with non-unknown key type",
        },
        {
            code: inlineValidReadonlyMapNoTypeArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyMap without generic arguments",
        },
        {
            code: inlineValidReadonlyMapWrongArityCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyMap with wrong generic arity",
        },
        {
            code: inlineValidGlobalReadonlyMapCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.ReadonlyMap reference",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-unknown-map.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
