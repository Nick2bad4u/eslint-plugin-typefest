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

const invalidFixtureName = "prefer-type-fest-value-of.invalid.ts";
const validFixtureName = "prefer-type-fest-value-of.valid.ts";
const inlineInvalidCode = [
    "type Input = {",
    "    alpha: string;",
    "    beta: number;",
    "};",
    "type Output = Input[keyof Input];",
].join("\n");
const inlineInvalidSpacedCode = [
    "type Input = {",
    "    alpha: string;",
    "    beta: number;",
    "};",
    "type Output = Input[keyof Input ];",
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
const skipPathInvalidCode = inlineInvalidCode;

ruleTester.run(
    "prefer-type-fest-value-of",
    getPluginRule("prefer-type-fest-value-of"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    { messageId: "preferValueOf" },
                    { messageId: "preferValueOf" },
                    { messageId: "preferValueOf" },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineInvalidCode,
                errors: [{ messageId: "preferValueOf" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineInvalidSpacedCode,
                errors: [{ messageId: "preferValueOf" }],
                filename: typedFixturePath(invalidFixtureName),
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidDifferentKeyCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidMismatchedObjectTextCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-type-fest-value-of.skip.ts"
                ),
            },
        ],
    }
);
