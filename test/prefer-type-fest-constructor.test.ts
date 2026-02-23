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

const validFixtureName = "prefer-type-fest-constructor.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-constructor.skip.ts";
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

addTypeFestRuleMetadataAndFilenameFallbackTests("prefer-type-fest-constructor");

ruleTester.run(
    "prefer-type-fest-constructor",
    getPluginRule("prefer-type-fest-constructor"),
    {
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
