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
                name: "reports fixture indexed-access value unions",
            },
            {
                code: inlineInvalidCode,
                errors: [{ messageId: "preferValueOf" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports direct T[keyof T] indexed-access alias",
            },
            {
                code: inlineInvalidSpacedCode,
                errors: [{ messageId: "preferValueOf" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports indexed-access alias with spaced keyof token",
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferValueOf" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes indexed-access alias with ValueOf import",
                output: inlineFixableOutputCode,
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
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-type-fest-value-of.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
