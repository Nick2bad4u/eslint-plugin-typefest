/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-has-in.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-object-has-in");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-has-in.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-has-in.invalid.ts";
const inlineInvalidThreeArgumentReflectHasCode = [
    "declare const monitorRecord: { readonly status?: string };",
    "",
    'const hasStatus = Reflect.has(monitorRecord, "status", "extra");',
    "",
    "String(hasStatus);",
].join("\n");
const inlineFixableReflectHasCode = [
    'import { objectHasIn } from "ts-extras";',
    "",
    "declare const monitorRecord: { readonly status?: string };",
    "",
    'const hasStatus = Reflect.has(monitorRecord, "status");',
    "",
    "String(hasStatus);",
].join("\n");
const inlineFixableReflectHasOutput = [
    'import { objectHasIn } from "ts-extras";',
    "",
    "declare const monitorRecord: { readonly status?: string };",
    "",
    'const hasStatus = objectHasIn(monitorRecord, "status");',
    "",
    "String(hasStatus);",
].join("\n");
const inlineValidComputedReflectHasCode = [
    "declare const monitorRecord: { readonly status?: string };",
    "",
    'const hasStatus = Reflect["has"](monitorRecord, "status");',
    "",
    "String(hasStatus);",
].join("\n");
const inlineValidReflectHasOneArgumentCode = [
    "declare const monitorRecord: { readonly status?: string };",
    "",
    "const hasStatus = Reflect.has(monitorRecord);",
    "",
    "String(hasStatus);",
].join("\n");
const inlineValidObjectHasOwnCode = [
    "declare const monitorRecord: { readonly status?: string };",
    "",
    'const hasStatus = Object.hasOwn(monitorRecord, "status");',
    "",
    "String(hasStatus);",
].join("\n");

ruleTester.run("prefer-ts-extras-object-has-in", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasObjectHasIn",
                },
                {
                    messageId: "preferTsExtrasObjectHasIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Reflect.has checks",
        },
        {
            code: inlineInvalidThreeArgumentReflectHasCode,
            errors: [{ messageId: "preferTsExtrasObjectHasIn" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Reflect.has call with extra argument",
        },
        {
            code: inlineFixableReflectHasCode,
            errors: [{ messageId: "preferTsExtrasObjectHasIn" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Reflect.has when objectHasIn import is in scope",
            output: inlineFixableReflectHasOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidComputedReflectHasCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores computed Reflect.has member access",
        },
        {
            code: inlineValidReflectHasOneArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Reflect.has call with too few arguments",
        },
        {
            code: inlineValidObjectHasOwnCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.hasOwn usage",
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
