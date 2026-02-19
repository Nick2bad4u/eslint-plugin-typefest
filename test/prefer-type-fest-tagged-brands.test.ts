/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-tagged-brands.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-tagged-brands.valid.ts";
const invalidFixtureName = "prefer-type-fest-tagged-brands.invalid.ts";
const importedAliasFixtureName =
    "prefer-type-fest-tagged-brands-imported-alias.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { Opaque } from "type-aliases";',
    'import type { Tagged } from "type-fest";',
    "",
    'type UserId = Opaque<string, "UserId">;',
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    'type UserId = Opaque<string, "UserId">;',
    'type UserId = Tagged<string, "UserId">;'
);

ruleTester.run(
    "prefer-type-fest-tagged-brands",
    getPluginRule("prefer-type-fest-tagged-brands"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [{ messageId: "preferTaggedBrand" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: readTypedFixture(importedAliasFixtureName),
                errors: [
                    {
                        data: {
                            alias: "Opaque",
                            replacement: "Tagged",
                        },
                        messageId: "preferTaggedAlias",
                    },
                    {
                        data: {
                            alias: "Branded",
                            replacement: "Tagged",
                        },
                        messageId: "preferTaggedAlias",
                    },
                ],
                filename: typedFixturePath(importedAliasFixtureName),
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "Opaque",
                            replacement: "Tagged",
                        },
                        messageId: "preferTaggedAlias",
                    },
                ],
                filename: typedFixturePath(importedAliasFixtureName),
                output: inlineFixableOutputCode,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
            },
        ],
    }
);
