/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-safe-cast-to.test` behavior.
 */
import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-safe-cast-to.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-ts-extras-safe-cast-to.skip.ts";
const invalidFixtureName = "prefer-ts-extras-safe-cast-to.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const nonAssignableAsExpressionValidCode = [
    "declare const rawValue: unknown;",
    "const parsed = rawValue as string;",
    "String(parsed);",
].join("\n");
const nonAssignableTypeAssertionValidCode = [
    "declare const rawValue: unknown;",
    "const parsed = <string>rawValue;",
    "String(parsed);",
].join("\n");
const ignoredAnyAnnotationValidCode = [
    'const rawValue = "alpha";',
    "const castValue = rawValue as any;",
    "String(castValue);",
].join("\n");
const ignoredNeverAnnotationValidCode = [
    "declare const neverValue: never;",
    "const castValue = neverValue as never;",
    "String(castValue);",
].join("\n");
const ignoredUnknownAnnotationValidCode = [
    'const rawValue = "alpha";',
    "const castValue = rawValue as unknown;",
    "String(castValue);",
].join("\n");
const inlineFixableCode = [
    'import { safeCastTo } from "ts-extras";',
    "",
    "const fallback = {} as Partial<{ value: number }>;",
    "",
    "String(fallback.value);",
].join("\n");
const inlineFixableOutput = [
    'import { safeCastTo } from "ts-extras";',
    "",
    "const fallback = safeCastTo<Partial<{ value: number }>>({});",
    "",
    "String(fallback.value);",
].join("\n");
const fixtureInvalidOutput = [
    "type Payload = {",
    "    id: number;",
    "    name: string;",
    "};",
    "",
    'const nameLiteral = "Alice";',
    "const nameValue = safeCastTo<string>(nameLiteral);",
    "",
    "const numberLiteral = 42;",
    "const numberValue = <number>numberLiteral;",
    "",
    "const payloadLiteral = {",
    "    id: 1,",
    '    name: "alpha",',
    "};",
    "const payloadValue = payloadLiteral as Payload;",
    "",
    "String(nameValue);",
    "String(numberValue);",
    "String(payloadValue);",
    "",
    'export const __typedFixtureModule = "typed-fixture-module";',
].join("\r\n");
const fixtureInvalidOutputWithMixedLineEndings = `import { safeCastTo } from "ts-extras";\n${fixtureInvalidOutput}\r\n`;
const fixtureInvalidSecondPassOutputWithMixedLineEndings =
    fixtureInvalidOutputWithMixedLineEndings
        .replace(
            "const numberValue = <number>numberLiteral;\r\n",
            "const numberValue = safeCastTo<number>(numberLiteral);\r\n"
        )
        .replace(
            "const payloadValue = payloadLiteral as Payload;\r\n",
            "const payloadValue = safeCastTo<Payload>(payloadLiteral);\r\n"
        );

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-ts-extras-safe-cast-to",
    {
        defaultOptions: [],
        docsDescription:
            "require ts-extras safeCastTo for assignable type assertions instead of direct `as` casts.",
        enforceRuleShape: true,
        messages: {
            preferTsExtrasSafeCastTo:
                "Prefer `safeCastTo<T>(value)` from `ts-extras` over direct `as` assertions when the cast is already type-safe.",
        },
        name: "prefer-ts-extras-safe-cast-to",
    }
);

ruleTester.run(
    "prefer-ts-extras-safe-cast-to",
    getPluginRule("prefer-ts-extras-safe-cast-to"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    { messageId: "preferTsExtrasSafeCastTo" },
                    { messageId: "preferTsExtrasSafeCastTo" },
                    { messageId: "preferTsExtrasSafeCastTo" },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture unsafe cast assertions",
                output: [
                    fixtureInvalidOutputWithMixedLineEndings,
                    fixtureInvalidSecondPassOutputWithMixedLineEndings,
                ],
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasSafeCastTo" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes safe cast assertion when safeCastTo import is in scope",
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
                code: nonAssignableAsExpressionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-assignable as-expression assertion",
            },
            {
                code: nonAssignableTypeAssertionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-assignable angle-bracket assertion",
            },
            {
                code: ignoredAnyAnnotationValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores as-expression assertions targeting any",
            },
            {
                code: ignoredNeverAnnotationValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores as-expression assertions targeting never",
            },
            {
                code: ignoredUnknownAnnotationValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores as-expression assertions targeting unknown",
            },
            {
                code: readTypedFixture(
                    skipTestPathFixtureDirectory,
                    skipTestPathFixtureName
                ),
                filename: typedFixturePath(
                    skipTestPathFixtureDirectory,
                    skipTestPathFixtureName
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
