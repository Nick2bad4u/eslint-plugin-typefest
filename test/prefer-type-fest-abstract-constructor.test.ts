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

const validFixtureName = "prefer-type-fest-abstract-constructor.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-abstract-constructor.skip.ts";
const invalidFixtureName = "prefer-type-fest-abstract-constructor.invalid.ts";
const inlineInvalidNoFilenameCode =
    "type AbstractCtor = abstract new (...args: readonly unknown[]) => object;";
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

ruleTester.run(
    "prefer-type-fest-abstract-constructor",
    getPluginRule("prefer-type-fest-abstract-constructor"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferAbstractConstructorSignature",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture abstract constructor signatures",
            },
            {
                code: inlineInvalidNoFilenameCode,
                errors: [
                    {
                        messageId: "preferAbstractConstructorSignature",
                    },
                ],
                name: "reports inline abstract constructor signature without filename",
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
