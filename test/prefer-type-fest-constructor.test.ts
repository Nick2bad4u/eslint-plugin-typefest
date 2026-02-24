import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-constructor.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-constructor";
const docsDescription =
    "require TypeFest Constructor over explicit `new (...) => ...` constructor signatures.";
const preferConstructorSignatureMessage =
    "Prefer `Constructor<...>` from type-fest over explicit `new (...) => ...` constructor signatures.";

const validFixtureName = "prefer-type-fest-constructor.valid.ts";
const invalidFixtureName = "prefer-type-fest-constructor.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { Constructor } from "type-fest";\n${invalidFixtureCode.replace(
    "new (\r\n    queueName: string,\r\n    retryCount: number\r\n) => QueueClient",
    "Constructor<QueueClient, [queueName: string, retryCount: number]>"
)}`;
const inlineInvalidNoFilenameCode =
    "type Ctor = new (...args: readonly unknown[]) => object;";
const inlineInvalidNoFilenameOutput = [
    'import type { Constructor } from "type-fest";',
    "type Ctor = Constructor<object, [...args: readonly unknown[]]>;",
].join("\n");
const inlineFixableCode = [
    'import type { Constructor } from "type-fest";',
    "",
    "type Ctor = new (name: string, retryCount: number) => object;",
].join("\n");
const inlineFixableOutput = [
    'import type { Constructor } from "type-fest";',
    "",
    "type Ctor = Constructor<object, [name: string, retryCount: number]>;",
].join("\n");
const inlineNoFixGenericCtorCode = [
    'import type { Constructor } from "type-fest";',
    "",
    "type GenericCtor = new <T>(value: T) => T;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferConstructorSignature: preferConstructorSignatureMessage,
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferConstructorSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture constructor signatures",
            output: fixtureFixableOutputCode,
        },
        {
            code: inlineInvalidNoFilenameCode,
            errors: [
                {
                    messageId: "preferConstructorSignature",
                },
            ],
            name: "reports inline constructor signature without filename",
            output: inlineInvalidNoFilenameOutput,
        },
        {
            code: inlineFixableCode,
            errors: [
                {
                    messageId: "preferConstructorSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes constructor signature when Constructor import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineNoFixGenericCtorCode,
            errors: [
                {
                    messageId: "preferConstructorSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports generic constructor signature without autofix",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
    ],
});
