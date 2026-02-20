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
const inlineInvalidMixedTypeLiteralMembersCode = [
    "type SessionIdentifier = string & {",
    '    readonly __brand: "SessionIdentifier";',
    "    (): void;",
    "};",
].join("\n");
const inlineValidNamespaceTaggedReferenceCode = [
    'import type * as TypeFest from "type-fest";',
    "",
    'type UserId = TypeFest.Tagged<string, "UserId">;',
].join("\n");
const inlineValidMethodSignatureBrandLikeCode = [
    "type SessionIdentifier = string & {",
    "    __brand(): void;",
    "};",
].join("\n");

ruleTester.run(
    "prefer-type-fest-tagged-brands",
    getPluginRule("prefer-type-fest-tagged-brands"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [{ messageId: "preferTaggedBrand" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture ad-hoc brand intersections",
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
                name: "reports imported opaque and branded aliases",
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
                name: "reports and autofixes imported Opaque alias",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineInvalidMixedTypeLiteralMembersCode,
                errors: [{ messageId: "preferTaggedBrand" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports mixed type-literal members in brand intersection",
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: inlineValidNamespaceTaggedReferenceCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores namespace-qualified Tagged usage",
            },
            {
                code: inlineValidMethodSignatureBrandLikeCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores method-signature-only brand-like type",
            },
            {
                code: readTypedFixture(invalidFixtureName),
                filename: typedFixturePath("tests", invalidFixtureName),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
