/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-writable.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-writable");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-writable.valid.ts";
const invalidFixtureName = "prefer-type-fest-writable.invalid.ts";
const importedAliasFixtureName =
    "prefer-type-fest-writable-imported-alias.invalid.ts";

ruleTester.run("prefer-type-fest-writable", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferWritable",
                },
                {
                    messageId: "preferWritable",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: readTypedFixture(importedAliasFixtureName),
            errors: [
                {
                    data: {
                        alias: "Mutable",
                        replacement: "Writable",
                    },
                    messageId: "preferWritableAlias",
                },
            ],
            filename: typedFixturePath(importedAliasFixtureName),
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
    ],
});
