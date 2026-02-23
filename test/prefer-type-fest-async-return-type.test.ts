import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-async-return-type.test` behavior.
 */
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
const skipPathInvalidCode = inlineInvalidCode;
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
    "prefer-type-fest-async-return-type"
);

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
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-async-return-type.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
