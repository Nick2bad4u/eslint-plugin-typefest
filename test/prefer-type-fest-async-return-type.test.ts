/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-async-return-type.test` behavior.
 */
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

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
        expect(ruleSource).toContain(
            "if (getSingleTypeArgument(awaitedInnerType) === null) {"
        );
        expect(ruleSource).toContain("return;");
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
