import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-simplify.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-simplify.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-simplify.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-simplify.skip.ts";
const invalidFixtureName = "prefer-type-fest-simplify.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'import type { Expand, Prettify } from "type-fest";\r\n',
        'import type { Expand, Prettify } from "type-fest";\nimport type { Simplify } from "type-fest";\r\n'
    )
    .replace("Expand<", "Simplify<");
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "Prettify<",
    "Simplify<"
);
const inlineFixableInvalidCode = [
    'import type { Expand, Simplify } from "type-fest";',
    "",
    "type Payload = {",
    "    id: string;",
    "};",
    "",
    "type Flattened = Expand<Payload>;",
    "",
    "String({} as Flattened);",
].join("\n");
const inlineInvalidWithoutFixCode = [
    'import type { Expand } from "type-fest";',
    "",
    "type Payload = {",
    "    id: string;",
    "};",
    "",
    "type Flattened = Expand<Payload>;",
].join("\n");
const inlineInvalidWithoutFixOutputCode = [
    'import type { Expand } from "type-fest";',
    'import type { Simplify } from "type-fest";',
    "",
    "type Payload = {",
    "    id: string;",
    "};",
    "",
    "type Flattened = Simplify<Payload>;",
].join("\n");
const inlineFixablePrettifyCode = [
    'import type { Prettify, Simplify } from "type-fest";',
    "",
    "type Payload = {",
    "    id: string;",
    "};",
    "",
    "type Flattened = Prettify<Payload>;",
].join("\n");
const inlineFixablePrettifyOutput = inlineFixablePrettifyCode.replace(
    "type Flattened = Prettify<Payload>;",
    "type Flattened = Simplify<Payload>;"
);

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Flattened = Expand<Payload>;",
    "type Flattened = Simplify<Payload>;"
);

addTypeFestRuleMetadataAndFilenameFallbackTests("prefer-type-fest-simplify", {
    defaultOptions: [],
    docsDescription:
        "require TypeFest Simplify over imported alias types like Prettify/Expand.",
    enforceRuleShape: true,
    messages: {
        preferSimplify:
            "Prefer `{{replacement}}` from type-fest to flatten resolved object and intersection types instead of legacy alias `{{alias}}`.",
    },
    name: "prefer-type-fest-simplify",
});

ruleTester.run(
    "prefer-type-fest-simplify",
    getPluginRule("prefer-type-fest-simplify"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "Expand",
                            replacement: "Simplify",
                        },
                        messageId: "preferSimplify",
                    },
                    {
                        data: {
                            alias: "Prettify",
                            replacement: "Simplify",
                        },
                        messageId: "preferSimplify",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture Id and Prettify aliases",
                output: [
                    fixtureFixableOutputCode,
                    fixtureFixableSecondPassOutputCode,
                ],
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "Expand",
                            replacement: "Simplify",
                        },
                        messageId: "preferSimplify",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline Id alias import",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineInvalidWithoutFixCode,
                errors: [
                    {
                        data: {
                            alias: "Expand",
                            replacement: "Simplify",
                        },
                        messageId: "preferSimplify",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports Expand alias without fix when Simplify import is missing",
                output: inlineInvalidWithoutFixOutputCode,
            },
            {
                code: inlineFixablePrettifyCode,
                errors: [
                    {
                        data: {
                            alias: "Prettify",
                            replacement: "Simplify",
                        },
                        messageId: "preferSimplify",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline Prettify alias import",
                output: inlineFixablePrettifyOutput,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: readTypedFixture(namespaceValidFixtureName),
                filename: typedFixturePath(namespaceValidFixtureName),
                name: "accepts namespace-qualified Simplify references",
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
