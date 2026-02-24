import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-schema.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-schema";
const docsDescription =
    "require TypeFest Schema over imported aliases such as RecordDeep.";
const preferSchemaMessage =
    "Prefer `{{replacement}}` from type-fest to model recursive object schemas instead of legacy alias `{{alias}}`.";

const validFixtureName = "prefer-type-fest-schema.valid.ts";
const namespaceValidFixtureName = "prefer-type-fest-schema.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-schema.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'import type { RecordDeep } from "type-aliases";\r\n',
        'import type { RecordDeep } from "type-aliases";\nimport type { Schema } from "type-fest";\r\n'
    )
    .replace("RecordDeep<", "Schema<");
const inlineFixableInvalidCode = [
    'import type { RecordDeep } from "type-aliases";',
    'import type { Schema } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "};",
    "",
    "type UserSchema = RecordDeep<User, number>;",
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type UserSchema = RecordDeep<User, number>;",
    "type UserSchema = Schema<User, number>;"
);

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferSchema: preferSchemaMessage,
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    data: {
                        alias: "RecordDeep",
                        replacement: "Schema",
                    },
                    messageId: "preferSchema",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Jsonify alias usage",
            output: fixtureFixableOutputCode,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "RecordDeep",
                        replacement: "Schema",
                    },
                    messageId: "preferSchema",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline Jsonify alias import",
            output: inlineFixableOutputCode,
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
            name: "accepts namespace-qualified Schema references",
        },
    ],
});
