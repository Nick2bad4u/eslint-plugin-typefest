import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-abstract-constructor.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-abstract-constructor";
const docsDescription =
    "require TypeFest AbstractConstructor over explicit `abstract new (...) => ...` signatures.";
const preferAbstractConstructorSignatureMessage =
    "Prefer `AbstractConstructor<...>` from type-fest over explicit `abstract new (...) => ...` signatures.";

const validFixtureName = "prefer-type-fest-abstract-constructor.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-abstract-constructor.skip.ts";
const invalidFixtureName = "prefer-type-fest-abstract-constructor.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { AbstractConstructor } from "type-fest";\n${invalidFixtureCode.replace(
    "abstract new (\r\n    queueName: string,\r\n    retryCount: number\r\n) => QueueClient",
    "AbstractConstructor<QueueClient, [queueName: string, retryCount: number]>"
)}`;
const inlineInvalidNoFilenameCode =
    "type AbstractCtor = abstract new (...args: readonly unknown[]) => object;";
const inlineInvalidNoFilenameOutput = [
    'import type { AbstractConstructor } from "type-fest";',
    "type AbstractCtor = AbstractConstructor<object, [...args: readonly unknown[]]>;",
].join("\n");
const inlineFixableCode = [
    'import type { AbstractConstructor } from "type-fest";',
    "",
    "type AbstractCtor = abstract new (name: string, retryCount: number) => object;",
].join("\n");
const inlineFixableOutput = [
    'import type { AbstractConstructor } from "type-fest";',
    "",
    "type AbstractCtor = AbstractConstructor<object, [name: string, retryCount: number]>;",
].join("\n");
const inlineNoFixGenericAbstractCtorCode = [
    'import type { AbstractConstructor } from "type-fest";',
    "",
    "type GenericAbstractCtor = abstract new <T>(value: T) => T;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferAbstractConstructorSignature:
            preferAbstractConstructorSignatureMessage,
    },
    name: ruleId,
});

ruleTester.run(
    ruleId,
    getPluginRule(ruleId),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        messageId: "preferAbstractConstructorSignature",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture abstract constructor signatures",
                output: fixtureFixableOutputCode,
            },
            {
                code: inlineInvalidNoFilenameCode,
                errors: [
                    {
                        messageId: "preferAbstractConstructorSignature",
                    },
                ],
                name: "reports inline abstract constructor signature without filename",
                output: inlineInvalidNoFilenameOutput,
            },
            {
                code: inlineFixableCode,
                errors: [
                    {
                        messageId: "preferAbstractConstructorSignature",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes abstract constructor signature when AbstractConstructor import is in scope",
                output: inlineFixableOutput,
            },
            {
                code: inlineNoFixGenericAbstractCtorCode,
                errors: [
                    {
                        messageId: "preferAbstractConstructorSignature",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports generic abstract constructor signature without autofix",
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
