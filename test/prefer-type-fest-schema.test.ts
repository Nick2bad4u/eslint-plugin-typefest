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

const validFixtureName = "prefer-type-fest-schema.valid.ts";
const namespaceValidFixtureName = "prefer-type-fest-schema.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-schema.skip.ts";
const invalidFixtureName = "prefer-type-fest-schema.invalid.ts";
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

ruleTester.run(
    "prefer-type-fest-schema",
    getPluginRule("prefer-type-fest-schema"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
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
