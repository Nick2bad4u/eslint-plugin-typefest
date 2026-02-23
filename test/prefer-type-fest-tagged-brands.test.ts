import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
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
const importedAliasFixtureCode = readTypedFixture(importedAliasFixtureName);
const importedAliasFixtureOutputCode = importedAliasFixtureCode
    .replace(
        'from "ts-essentials";\r\n',
        'from "ts-essentials";\nimport type { Tagged } from "type-fest";\r\n'
    )
    .replace("Opaque<", "Tagged<");
const importedAliasFixtureSecondPassOutputCode =
    importedAliasFixtureOutputCode.replace("Branded<", "Tagged<");
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
const inlineValidNonBrandPropertyIntersectionCode = [
    "type SessionIdentifier = string & {",
    '    readonly label: "SessionIdentifier";',
    "};",
].join("\n");
const inlineValidTaggedAndBrandIntersectionCode = [
    'import type { Tagged } from "type-fest";',
    "",
    'type SessionIdentifier = Tagged<string, "SessionIdentifier"> & {',
    '    readonly __brand: "SessionIdentifier";',
    "};",
].join("\n");
const inlineValidNestedTaggedReferenceCode = [
    'import type { Tagged } from "type-fest";',
    "",
    "type SessionIdentifier = (",
    '    | Tagged<string, "SessionIdentifier">',
    "    | number",
    ") & {",
    '    readonly __brand: "SessionIdentifier";',
    "};",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-tagged-brands"
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
                name: "reports fixture ad-hoc brand intersections",
            },
            {
                code: importedAliasFixtureCode,
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
                output: [
                    importedAliasFixtureOutputCode,
                    importedAliasFixtureSecondPassOutputCode,
                ],
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
                code: inlineValidNonBrandPropertyIntersectionCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores intersection property that is not a branding key",
            },
            {
                code: inlineValidTaggedAndBrandIntersectionCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores ad-hoc brand literal when Tagged already exists",
            },
            {
                code: inlineValidNestedTaggedReferenceCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores nested Tagged references inside union and intersection",
            },
            {
                code: readTypedFixture(invalidFixtureName),
                filename: typedFixturePath("tests", invalidFixtureName),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
