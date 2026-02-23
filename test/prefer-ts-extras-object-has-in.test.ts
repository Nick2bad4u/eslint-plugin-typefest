/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-has-in.test` behavior.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
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
const inlineInvalidThreeArgumentReflectHasOutput = [
    'import { objectHasIn } from "ts-extras";',
    "declare const monitorRecord: { readonly status?: string };",
    "",
    'const hasStatus = objectHasIn(monitorRecord, "status", "extra");',
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
const inlineValidCustomHasMethodCode = [
    "const helper = {",
    "    has(target: object, key: PropertyKey): boolean {",
    "        return key in target;",
    "    },",
    "};",
    'const hasStatus = helper.has({ status: "ok" }, "status");',
    "String(hasStatus);",
].join("\n");
const inlineValidReflectGetCode = [
    "declare const monitorRecord: { readonly status?: string };",
    'const value = Reflect.get(monitorRecord, "status");',
    "String(value);",
].join("\n");
const inlineValidGlobalReflectHasCode = [
    "declare const monitorRecord: { readonly status?: string };",
    'const hasStatus = globalThis.Reflect.has(monitorRecord, "status");',
    "String(hasStatus);",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-ts-extras-object-has-in",
    {
        defaultOptions: [],
        docsDescription:
            "require ts-extras objectHasIn over Reflect.has for stronger key-in-object narrowing.",
        enforceRuleShape: true,
        messages: {
            preferTsExtrasObjectHasIn:
                "Prefer `objectHasIn` from `ts-extras` over `Reflect.has` for better type narrowing.",
        },
        name: "prefer-ts-extras-object-has-in",
    }
);

it("keeps object-has-in callee predicate guard clauses in source", () => {
    const ruleSource = readFileSync(
        path.resolve(
            process.cwd(),
            "src/rules/prefer-ts-extras-object-has-in.ts"
        ),
        "utf8"
    );

    expect(ruleSource).toContain(
        'node.callee.object.type === "Identifier" &&'
    );
    expect(ruleSource).toContain(
        'node.callee.object.name === "Reflect" &&'
    );
    expect(ruleSource).toContain(
        'node.callee.property.type === "Identifier" &&'
    );
    expect(ruleSource).toContain('node.callee.property.name === "has"');
});

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
            output: inlineInvalidThreeArgumentReflectHasOutput,
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
            code: inlineValidCustomHasMethodCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-Reflect has helper calls",
        },
        {
            code: inlineValidReflectGetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Reflect member calls that are not has",
        },
        {
            code: inlineValidGlobalReflectHasCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis-qualified Reflect.has calls",
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
