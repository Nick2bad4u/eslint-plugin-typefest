/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-has-own.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const invalidFixtureName = "prefer-ts-extras-object-has-own.invalid.ts";
const validFixtureName = "prefer-ts-extras-object-has-own.valid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        "declare const candidate: unknown;\r\n",
        'import { objectHasOwn } from "ts-extras";\ndeclare const candidate: unknown;\r\n'
    )
    .replace(
        'Object.hasOwn(candidate, "status")',
        'objectHasOwn(candidate, "status")'
    );
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "Object.hasOwn(variants, propertyName)",
    "objectHasOwn(variants, propertyName)"
);
const fixtureFixableThirdPassOutputCode =
    fixtureFixableSecondPassOutputCode.replace(
        'Object.hasOwn(variants, "success")',
        'objectHasOwn(variants, "success")'
    );
const inlineFixableCode = [
    'import { objectHasOwn } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const hasAlpha = Object.hasOwn(sample, 'alpha');",
].join("\n");
const inlineFixableOutput = [
    'import { objectHasOwn } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const hasAlpha = objectHasOwn(sample, 'alpha');",
].join("\n");
const inlineValidComputedObjectHasOwnCode = [
    "declare const variants: { readonly success: string };",
    "",
    'const hasSuccess = Object["hasOwn"](variants, "success");',
    "",
    "String(hasSuccess);",
].join("\n");
const inlineValidReflectHasOwnCode = [
    "declare const variants: { readonly success: string };",
    "",
    'const hasSuccess = Reflect.has(variants, "success");',
    "",
    "String(hasSuccess);",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-object-has-own",
    getPluginRule("prefer-ts-extras-object-has-own"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    { messageId: "preferTsExtrasObjectHasOwn" },
                    { messageId: "preferTsExtrasObjectHasOwn" },
                    { messageId: "preferTsExtrasObjectHasOwn" },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture Object.hasOwn checks",
                output: [
                    fixtureFixableOutputCode,
                    fixtureFixableThirdPassOutputCode,
                ],
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasObjectHasOwn" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes Object.hasOwn when objectHasOwn import is in scope",
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
                code: inlineValidComputedObjectHasOwnCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores computed Object.hasOwn member access",
            },
            {
                code: inlineValidReflectHasOwnCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores Reflect.has usage",
            },
            {
                code: readTypedFixture(invalidFixtureName),
                filename: typedFixturePath("tests", invalidFixtureName),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
