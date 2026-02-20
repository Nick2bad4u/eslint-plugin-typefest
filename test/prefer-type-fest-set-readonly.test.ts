/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-set-readonly.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-set-readonly.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-set-readonly.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-set-readonly.skip.ts";
const invalidFixtureName = "prefer-type-fest-set-readonly.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { ReadonlyBy } from "type-aliases";',
    'import type { SetReadonly } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "};",
    "",
    'type FrozenUser = ReadonlyBy<User, "id">;',
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    'type FrozenUser = ReadonlyBy<User, "id">;',
    'type FrozenUser = SetReadonly<User, "id">;'
);

ruleTester.run(
    "prefer-type-fest-set-readonly",
    getPluginRule("prefer-type-fest-set-readonly"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "ReadonlyBy",
                            replacement: "SetReadonly",
                        },
                        messageId: "preferSetReadonly",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture MarkReadonly and ReadonlyBy aliases",
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "ReadonlyBy",
                            replacement: "SetReadonly",
                        },
                        messageId: "preferSetReadonly",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline MarkReadonly alias import",
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
                name: "accepts namespace-qualified SetReadonly references",
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
