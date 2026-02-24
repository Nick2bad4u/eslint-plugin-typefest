import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-value-of.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const ruleId = "prefer-type-fest-value-of";
const docsDescription =
    "require TypeFest ValueOf over direct T[keyof T] indexed-access unions for object value extraction.";
const preferValueOfMessage =
    "Prefer `ValueOf<T>` from type-fest over `T[keyof T]` for object value unions.";

const invalidFixtureName = "prefer-type-fest-value-of.invalid.ts";
const validFixtureName = "prefer-type-fest-value-of.valid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { ValueOf } from "type-fest";\n${invalidFixtureCode.replace(
    "T[keyof T]",
    "ValueOf<T>"
)}`;
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "SiteEventPayloadMap[keyof SiteEventPayloadMap]",
    "ValueOf<SiteEventPayloadMap>"
);
const fixtureFixableThirdPassOutputCode =
    fixtureFixableSecondPassOutputCode.replace(
        "TemplateVariableMap[keyof TemplateVariableMap]",
        "ValueOf<TemplateVariableMap>"
    );
const inlineInvalidCode = [
    "type Input = {",
    "    alpha: string;",
    "    beta: number;",
    "};",
    "type Output = Input[keyof Input];",
].join("\n");
const inlineInvalidOutputCode = [
    'import type { ValueOf } from "type-fest";',
    "type Input = {",
    "    alpha: string;",
    "    beta: number;",
    "};",
    "type Output = ValueOf<Input>;",
].join("\n");
const inlineInvalidSpacedCode = [
    "type Input = {",
    "    alpha: string;",
    "    beta: number;",
    "};",
    "type Output = Input[keyof Input ];",
].join("\n");
const inlineFixableInvalidCode = [
    'import type { ValueOf } from "type-fest";',
    "type Input = {",
    "    alpha: string;",
    "    beta: number;",
    "};",
    "type Output = Input[keyof Input];",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Output = Input[keyof Input];",
    "type Output = ValueOf<Input>;"
);
const inlineInvalidWhitespaceFormattedLiteralCode = [
    "type Output = { alpha: string; beta: number; }[",
    "    keyof {",
    "        alpha: string;",
    "        beta: number;",
    "    }",
    "];",
].join("\n");
const inlineInvalidWhitespaceFormattedLiteralOutputCode = [
    'import type { ValueOf } from "type-fest";',
    "type Output = ValueOf<{ alpha: string; beta: number; }>;",
].join("\n");
const inlineNoFixShadowedValueOfInvalidCode = [
    'import type { ValueOf } from "type-fest";',
    "type Box<ValueOf extends object> = ValueOf[keyof ValueOf];",
].join("\n");
const inlineValidDifferentKeyCode = [
    "type Input = {",
    "    alpha: string;",
    "    beta: number;",
    "};",
    "type Output = Input['alpha'];",
].join("\n");
const inlineValidMismatchedObjectTextCode = [
    "type Input = {",
    "    alpha: string;",
    "    beta: number;",
    "};",
    "type Alias = Input;",
    "type Output = Input[keyof Alias];",
].join("\n");
const inlineValidReadonlyTypeOperatorCode = [
    "type Input = {",
    "    alpha: string;",
    "};",
    "type Output = Input[readonly Input];",
].join("\n");
const skipPathInvalidCode = inlineInvalidCode;

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferValueOf: preferValueOfMessage,
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                { messageId: "preferValueOf" },
                { messageId: "preferValueOf" },
                { messageId: "preferValueOf" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture indexed-access value unions",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableThirdPassOutputCode,
            ],
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferValueOf" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct T[keyof T] indexed-access alias",
            output: inlineInvalidOutputCode,
        },
        {
            code: inlineInvalidSpacedCode,
            errors: [{ messageId: "preferValueOf" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports indexed-access alias with spaced keyof token",
            output: inlineInvalidOutputCode,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [{ messageId: "preferValueOf" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes indexed-access alias with ValueOf import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineInvalidWhitespaceFormattedLiteralCode,
            errors: [{ messageId: "preferValueOf" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports differently formatted inline type literals with equivalent structure",
            output: inlineInvalidWhitespaceFormattedLiteralOutputCode,
        },
        {
            code: inlineNoFixShadowedValueOfInvalidCode,
            errors: [{ messageId: "preferValueOf" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports indexed-access alias when ValueOf identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidDifferentKeyCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores indexed access with explicit literal key",
        },
        {
            code: inlineValidMismatchedObjectTextCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores keyed access when object text and keyof target differ",
        },
        {
            code: inlineValidReadonlyTypeOperatorCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores indexed access when type operator is not keyof",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-value-of.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
