/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-async-return-type.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-async-return-type");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-async-return-type.valid.ts";
const invalidFixtureName = "prefer-type-fest-async-return-type.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { AsyncReturnType } from "type-fest";\n${invalidFixtureCode.replace(
    "Awaited<ReturnType<MonitorProbe>>",
    "AsyncReturnType<MonitorProbe>"
)}`;
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "Awaited<ReturnType<typeof loadMonitorSummary>>",
    "AsyncReturnType<typeof loadMonitorSummary>"
);
const inlineInvalidCode =
    "type Result = Awaited<ReturnType<() => Promise<string>>>;";
const inlineInvalidOutput = [
    'import type { AsyncReturnType } from "type-fest";',
    "type Result = AsyncReturnType<() => Promise<string>>;",
].join("\n");
const inlineInvalidWithoutFixCode =
    "type Result = Awaited<ReturnType<() => Promise<string>>>;";
const inlineInvalidWithoutFixOutput = inlineInvalidOutput;
const shadowedReplacementNameInvalidCode =
    "type Wrapper<AsyncReturnType extends (...arguments_: never[]) => Promise<string>> = Awaited<ReturnType<AsyncReturnType>>;";
const awaitedWithoutTypeArgumentValidCode = "type Result = Awaited;";
const awaitedNonReturnTypeValidCode = "type Result = Awaited<string>;";
const awaitedExtraTypeArgumentValidCode =
    "type Result = Awaited<ReturnType<() => Promise<string>>, string>;";
const awaitedReturnTypeWithoutArgValidCode =
    "type Result = Awaited<ReturnType>;";
const awaitedReturnTypeWithExtraTypeArgumentValidCode =
    "type Result = Awaited<ReturnType<() => Promise<string>, string>>;";
const awaitedPromiseTypeReferenceValidCode =
    "type Result = Awaited<Promise<string>>;";
const awaitedQualifiedReturnTypeValidCode = [
    'import type * as TypeFest from "type-fest";',
    "",
    "type Result = Awaited<TypeFest.ReturnType<() => Promise<string>>>;",
].join("\n");
const nonAwaitedWrapperOfReturnTypeValidCode = [
    "type Wrapper<T> = T;",
    "type Result = Wrapper<ReturnType<() => Promise<string>>>;",
].join("\n");
const inlineFixableCode = [
    'import type { AsyncReturnType } from "type-fest";',
    "",
    "type Result = Awaited<ReturnType<() => Promise<string>>>;",
].join("\n");
const inlineFixableOutput = [
    'import type { AsyncReturnType } from "type-fest";',
    "",
    "type Result = AsyncReturnType<() => Promise<string>>;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-async-return-type",
    {
        defaultOptions: [],
        docsDescription:
            "require TypeFest AsyncReturnType over Awaited<ReturnType<T>> compositions for async return extraction.",
        enforceRuleShape: true,
        messages: {
            preferAsyncReturnType:
                "Prefer `AsyncReturnType<T>` from type-fest over `Awaited<ReturnType<T>>`.",
        },
        name: "prefer-type-fest-async-return-type",
    }
);

describe("prefer-type-fest-async-return-type source assertions", () => {
    it("keeps async-return-type helper constants and guard clauses in source", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-type-fest-async-return-type.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain('const AWAITED_TYPE_NAME = "Awaited";');
        expect(ruleSource).toContain('const RETURN_TYPE_NAME = "ReturnType";');
        expect(ruleSource).toContain(
            "if (!isIdentifierTypeReference(node, AWAITED_TYPE_NAME)) {"
        );
        expect(ruleSource).toContain("if (returnTypeArgument === null) {");
        expect(ruleSource).toContain("return;");
    });

    it("handles defensive malformed-type-argument fallback without reporting", async () => {
        try {
            vi.resetModules();

            vi.doMock("../src/_internal/imported-type-aliases.js", () => ({
                collectDirectNamedImportsFromSource: () =>
                    new Set(["AsyncReturnType"]),
                createSafeTypeNodeTextReplacementFix: () => null,
            }));

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: (): boolean => false,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-async-return-type")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            const sourceText =
                "type Result = Awaited<ReturnType<() => Promise<string>>>;";
            const parsed = parser.parseForESLint(sourceText, {
                ecmaVersion: "latest",
                loc: true,
                range: true,
                sourceType: "module",
            });

            const [statement] = parsed.ast.body;
            if (
                statement?.type !== AST_NODE_TYPES.TSTypeAliasDeclaration ||
                statement.typeAnnotation.type !== AST_NODE_TYPES.TSTypeReference
            ) {
                throw new Error(
                    "Expected Awaited<ReturnType<...>> type alias AST shape"
                );
            }

            const awaitedReferenceNode = statement.typeAnnotation;
            if (awaitedReferenceNode.typeArguments === undefined) {
                throw new Error(
                    "Expected Awaited type arguments for malformed-params test"
                );
            }

            Object.defineProperty(
                awaitedReferenceNode.typeArguments,
                "params",
                {
                    value: [undefined],
                }
            );

            const report = vi.fn();
            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-type-fest-async-return-type.invalid.ts",
                report,
                sourceCode: {
                    ast: parsed.ast,
                    getText: () => "() => Promise<string>",
                },
            });

            listenerMap.TSTypeReference?.(awaitedReferenceNode);

            expect(report).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run("prefer-type-fest-async-return-type", rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferAsyncReturnType",
                },
                {
                    messageId: "preferAsyncReturnType",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Awaited<ReturnType<...>> compositions",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferAsyncReturnType" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports inline Awaited<ReturnType<...>> composition",
            output: inlineInvalidOutput,
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferAsyncReturnType" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Awaited<ReturnType<...>> without fix when AsyncReturnType import is missing",
            output: inlineInvalidWithoutFixOutput,
        },
        {
            code: shadowedReplacementNameInvalidCode,
            errors: [{ messageId: "preferAsyncReturnType" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports without autofix when AsyncReturnType identifier is shadowed by a type parameter",
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferAsyncReturnType" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Awaited<ReturnType<...>> when AsyncReturnType import is in scope",
            output: inlineFixableOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: awaitedWithoutTypeArgumentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores bare Awaited reference",
        },
        {
            code: awaitedNonReturnTypeValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Awaited over direct non-ReturnType operand",
        },
        {
            code: awaitedExtraTypeArgumentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Awaited references with extra type arguments",
        },
        {
            code: awaitedReturnTypeWithoutArgValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Awaited<ReturnType> without type arguments",
        },
        {
            code: awaitedReturnTypeWithExtraTypeArgumentValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Awaited<ReturnType<...>> when ReturnType has extra type arguments",
        },
        {
            code: awaitedPromiseTypeReferenceValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Awaited over Promise<T>",
        },
        {
            code: awaitedQualifiedReturnTypeValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Awaited over namespace-qualified ReturnType",
        },
        {
            code: nonAwaitedWrapperOfReturnTypeValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-Awaited wrappers around ReturnType operands",
        },
    ],
});
